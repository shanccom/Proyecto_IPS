from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Max
from django.contrib.contenttypes.models import ContentType
from .models import Cliente, Luna, Boleta, ItemBoleta
from inventario.models import Montura, Accesorio
from .serializers import ClienteSerializer, LunaSerializer, EmpleadoSerializer
from rest_framework.views import APIView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime
from decimal import Decimal
from rest_framework.decorators import api_view

from services.microservicio_service import MicroservicioSunatService

import requests
from django.conf import settings

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class LunaViewSet(viewsets.ModelViewSet):
    queryset = Luna.objects.all()
    serializer_class = LunaSerializer

    @action(detail=False, methods=['get'])
    def opciones(self, request):
        return Response({
            'propiedades': Luna.LUNA_CHOICES,
            'materiales': Luna.MATERIALLUNA_CHOICES,
            'colores_halo': Luna.HALO_CHOICES
        })
        
# Recuperar
# Verificaciones 
# añadir empleado
def buscar_producto(codigo_producto):

    if str(codigo_producto).isdigit():
        try:
            producto = Luna.objects.get(lunaCod=int(codigo_producto))
            content_type = ContentType.objects.get_for_model(Luna)
            precio = producto.lunaPrecioVenta
            return producto, content_type, precio
        except (Luna.DoesNotExist, ValueError):
            pass
        
        # Buscar en Accesorio (códigos enteros: 1, 2, 3, etc.)
        try:
            producto = Accesorio.objects.get(accCod=int(codigo_producto))
            content_type = ContentType.objects.get_for_model(Accesorio)
            precio = producto.proPrecioVenta
            return producto, content_type, precio
        except (Accesorio.DoesNotExist, ValueError):
            pass
    
    # Buscar en Montura (códigos string: M112, M123, etc.)
    try:
        producto = Montura.objects.get(monCod=str(codigo_producto))
        content_type = ContentType.objects.get_for_model(Montura)
        precio = producto.proPrecioVenta
        return producto, content_type, precio
    except Montura.DoesNotExist:
        pass
    
    return None, None, None

@csrf_exempt
@require_http_methods(["POST"])
def crear_boleta(request):
    try:
        data = json.loads(request.body)
        print(f"Datos recibidos: {data}")
        
        # Validar datos requeridos
        required_fields = ['serie', 'cliente', 'items', 'subtotal', 'igv', 'total']
        for field in required_fields:
            if field not in data:
                return JsonResponse({
                    'error': f'Campo requerido: {field}'
                }, status=400)
        
        # Validar que hay items
        if not data['items'] or len(data['items']) == 0:
            return JsonResponse({
                'error': 'Debe incluir al menos un item'
            }, status=400)
        
        # Buscar o crear el cliente
        cliente_data = data['cliente']
        cliente, created = Cliente.objects.get_or_create(
            cliNumDoc=cliente_data['num_doc'],
            defaults={
                'cliNom': cliente_data['rzn_social'],
                'cliNumCel': '',
                'cliEmail': ''
            }
        )
        
        # Obtener siguiente correlativo
        ultima_boleta = Boleta.objects.filter(serie=data['serie']).aggregate(
            max_correlativo=Max('correlativo')
        )
        
        if ultima_boleta['max_correlativo']:
            try:
                siguiente_numero = int(ultima_boleta['max_correlativo']) + 1
            except ValueError:
                siguiente_numero = 1
        else:
            siguiente_numero = 1
        
        correlativo = f"{siguiente_numero:06d}"
        
        # ✅ CREAR LA BOLETA CON ESTADO 'pendiente' (SIN ENVIAR A SUNAT)
        boleta = Boleta.objects.create(
            serie=data['serie'],
            correlativo=correlativo,
            cliente=cliente,
            subtotal=Decimal(str(data['subtotal'])),
            igv=Decimal(str(data['igv'])),
            total=Decimal(str(data['total'])),
            estado='pendiente',  # ✅ Estado inicial
            enviado_sunat=False  # ✅ No enviado aún
        )
        
        # Crear los items de la boleta (tu lógica existente)
        for item_data in data['items']:
            try:
                print(f"Procesando item: {item_data}")
                
                cantidad = item_data.get('cantidad', 1)
                valor_unitario = item_data.get('valor_unitario')
                producto_id = item_data.get('producto_id')
                codigo_producto = item_data.get('codigo', '')
                descripcion = item_data.get('descripcion', '')
                
                if cantidad <= 0:
                    boleta.delete()
                    return JsonResponse({
                        'error': 'La cantidad debe ser mayor a 0'
                    }, status=400)
                
                if not valor_unitario or valor_unitario <= 0:
                    boleta.delete()
                    return JsonResponse({
                        'error': 'El valor unitario debe ser mayor a 0'
                    }, status=400)
                
                # Determinar si es producto personalizado o normal
                es_producto_personalizado = (
                    not producto_id or 
                    producto_id is None or 
                    producto_id == 'null' or
                    str(producto_id).lower() == 'null'
                )
                
                if es_producto_personalizado:
                    if not descripcion:
                        boleta.delete()
                        return JsonResponse({
                            'error': 'Descripción es requerida para productos personalizados'
                        }, status=400)
                    
                    ItemBoleta.objects.create(
                        boleta=boleta,
                        content_type=None,
                        object_id=None,
                        cantidad=cantidad,
                        valor_unitario=Decimal(str(valor_unitario)),
                        descripcion_personalizada=descripcion
                    )
                else:
                    producto, content_type, precio = buscar_producto(producto_id)
                    
                    if not producto:
                        boleta.delete()
                        return JsonResponse({
                            'error': f'Producto con código {producto_id} no encontrado'
                        }, status=404)
                    
                    ItemBoleta.objects.create(
                        boleta=boleta,
                        content_type=content_type,
                        object_id=str(producto.pk),
                        cantidad=cantidad,
                        valor_unitario=Decimal(str(valor_unitario)),
                        descripcion_personalizada=None
                    )
                
            except Exception as e:
                print(f"Error al procesar item: {str(e)}")
                boleta.delete()
                return JsonResponse({
                    'error': f'Error al procesar item: {str(e)}'
                }, status=500)
        
        # Preparar items para respuesta
        items_response = []
        for item in boleta.items.all():
            item_data = {
                'cantidad': item.cantidad,
                'valor_unitario': float(item.valor_unitario),
                'subtotal': float(item.subtotal)
            }
            
            if item.descripcion_personalizada:
                item_data.update({
                    'codigo': 'PERSONALIZADO',
                    'descripcion': item.descripcion_personalizada,
                    'tipo': 'personalizado'
                })
            elif item.content_object:
                producto = item.content_object
                item_data.update({
                    'codigo': getattr(producto, 'codigo', ''),
                    'descripcion': getattr(producto, 'nombre', str(producto)),
                    'tipo': 'inventario',
                    'producto_id': producto.pk
                })
            
            items_response.append(item_data)
        
        # ✅ NO ENVIAR A SUNAT AUTOMÁTICAMENTE
        # El envío se hará desde la lista de ventas usando reenviar_boleta_sunat
        
        # Respuesta exitosa
        response_data = {
            'id': boleta.id,
            'serie': boleta.serie,
            'correlativo': boleta.correlativo,
            'fecha_emision': boleta.fecha.strftime('%Y-%m-%d %H:%M:%S'),
            'cliente': {
                'tipo_doc': '1',
                'num_doc': boleta.cliente.cliNumDoc,
                'rzn_social': boleta.cliente.cliNom
            },
            'items': items_response,
            'subtotal': float(boleta.subtotal),
            'igv': float(boleta.igv),
            'total': float(boleta.total),
            'estado': 'pendiente',  # ✅ Estado inicial
            'enviado_sunat': False,  # ✅ No enviado
            'mensaje': 'Boleta creada exitosamente. Puede enviarla a SUNAT desde la lista de ventas.'
        }
        
        print(f"Boleta creada exitosamente: {response_data}")
        return JsonResponse(response_data, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        print(f"Error general: {str(e)}")
        return JsonResponse({'error': f'Error interno: {str(e)}'}, status=500)

@require_http_methods(["GET"])
def obtener_siguiente_correlativo(request, serie):
    try:
        ultima_boleta = Boleta.objects.filter(serie=serie).aggregate(
            max_correlativo=Max('correlativo')
        )
        
        if ultima_boleta['max_correlativo']:
            try:
                siguiente_numero = int(ultima_boleta['max_correlativo']) + 1
            except ValueError:
                siguiente_numero = 1
        else:
            siguiente_numero = 1
        
        correlativo = f"{siguiente_numero:06d}"
        
        return JsonResponse({
            'correlativo': correlativo
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@require_http_methods(["GET"])
def listar_boletas(request):
    try:
        boletas = Boleta.objects.all().prefetch_related('items__content_object').order_by('-fecha')
        
        boletas_data = []
        for boleta in boletas:
            items = []
            for item in boleta.items.all():
                producto = item.content_object
                producto_info = {}

                # Identificar tipo de producto según campos únicos
                if hasattr(producto, 'lunaCod'):
                    producto_info = {
                        'codigo': producto.lunaCod,
                        'tipo': 'Luna',
                        'precio': float(producto.lunaPrecioVenta)
                    }
                elif hasattr(producto, 'monCod'):
                    producto_info = {
                        'codigo': producto.monCod,
                        'tipo': 'Montura',
                        'precio': float(producto.proPrecioVenta)
                    }
                elif hasattr(producto, 'accCod'):
                    producto_info = {
                        'codigo': producto.accCod,
                        'tipo': 'Accesorio',
                        'precio': float(producto.proPrecioVenta)
                    }

                items.append({
                    'producto': str(producto),
                    'descripcion': str(producto),
                    'producto_info': producto_info,
                    'cantidad': item.cantidad,
                    'valor_unitario': float(item.valor_unitario),
                    'subtotal': float(item.cantidad * item.valor_unitario)
                })

            boletas_data.append({
                'id': boleta.id,
                'serie': boleta.serie,
                'correlativo': boleta.correlativo,
                'fecha_emision': boleta.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                'cliente': {
                    'tipo_doc': '1',
                    'num_doc': boleta.cliente.cliNumDoc,
                    'rzn_social': boleta.cliente.cliNom
                },
                'items': items,
                'subtotal': float(boleta.subtotal),
                'igv': float(boleta.igv),
                'total': float(boleta.total),
                'estado': boleta.estado
            })

        return JsonResponse({
            'boletas': boletas_data,
            'total_boletas': len(boletas_data)
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
@require_http_methods(["POST"])
def reenviar_boleta_sunat(request, boleta_id):
    """
    Reenvía una boleta específica a SUNAT
    """
    try:
        boleta = Boleta.objects.get(id=boleta_id)
        
        microservicio_service = MicroservicioSunatService()
        resultado = microservicio_service.enviar_boleta_sunat(boleta)
        
        return JsonResponse({
            'success': resultado['success'],
            'mensaje': resultado.get('mensaje', ''),
            'error': resultado.get('error', ''),
            'boleta_id': boleta_id
        })
        
    except Boleta.DoesNotExist:
        return JsonResponse({
            'error': 'Boleta no encontrada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'error': f'Error al reenviar: {str(e)}'
        }, status=500)

@require_http_methods(["GET"])
def descargar_cdr(request, boleta_id):
    """
    Descarga el CDR de una boleta desde el microservicio
    """
    try:
        boleta = Boleta.objects.get(id=boleta_id)
        
        if not boleta.nombre_cdr:
            return JsonResponse({
                'error': 'Esta boleta no tiene CDR disponible'
            }, status=404)
        
        # Obtener CDR del microservicio
        microservicio_url = getattr(settings, 'MICROSERVICIO_SUNAT_URL', 'http://localhost/microservicio-comprobantes/public')
        cdr_url = f'{microservicio_url}/cdr/{boleta.nombre_cdr}'
        
        response = requests.get(cdr_url, timeout=30)
        
        if response.status_code == 200:
            # Retornar el archivo CDR
            from django.http import HttpResponse
            http_response = HttpResponse(
                response.content,
                content_type='application/zip'
            )
            http_response['Content-Disposition'] = f'attachment; filename="{boleta.nombre_cdr}"'
            return http_response
        else:
            return JsonResponse({
                'error': 'CDR no encontrado en el microservicio'
            }, status=404)
            
    except Boleta.DoesNotExist:
        return JsonResponse({
            'error': 'Boleta no encontrada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'error': f'Error al descargar CDR: {str(e)}'
        }, status=500)


# Empleados
# Añadir empleados
@api_view(['POST'])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
# Editar condicion de empleado
def new_empleado(request):
    emplCod = request.data.get('emplCod')
    emplNom = request.data.get('emplNom')
    emplCarg = request.data.get('emplCarg')
    emplCond = request.data.get('emplCond')
    
    if not emplCod or not emplNom:
        return Response({"error": "emplCod y emplNom son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        Empleado = Empleado.objects.create(
            emplCod = emplCod,
            emplNom = emplNom,
            emplCarg = emplCarg,
            emplCond = emplCond,
        )
        serializer = EmpleadoSerializer(Empleado)
        return Response(serializer.data, status= status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error":str(e)})
        

