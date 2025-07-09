from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Max
from django.contrib.contenttypes.models import ContentType
from .models import Cliente, Luna, Boleta, ItemBoleta
from inventario.models import Montura, Accesorio
from .serializers import ClienteSerializer, LunaSerializer, EmpleadoSerializer, PagoAdelantoSerializer
from rest_framework.views import APIView
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from datetime import datetime
from decimal import Decimal
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from pathlib import Path
import logging
from django.db import transaction
from services.microservicio_service import MicroservicioSunatService
import requests
from django.conf import settings
from .models import PagoAdelanto
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes

#dashboard
from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta
#

#Hora ventas
from django.utils.timezone import localtime

logger = logging.getLogger(__name__)


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
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
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
        
        # ✅ CREAR LA BOLETA SIN CORRELATIVO PRIMERO
        boleta = Boleta.objects.create(
            serie=data['serie'],
            correlativo='', # Temporal, se actualizará después
            cliente=cliente,
            subtotal=Decimal(str(data['subtotal'])),
            igv=Decimal(str(data['igv'])),
            total=Decimal(str(data['total'])),
            estado='pendiente',
            enviado_sunat=False
        )
        
        # ✅ USAR EL ID DE LA BD COMO CORRELATIVO
        correlativo = f"{boleta.id:06d}"  # Formato: 000001, 000002, etc.
        
        # ✅ ACTUALIZAR EL CORRELATIVO
        boleta.correlativo = correlativo
        boleta.save(update_fields=['correlativo'])
        
        # Resto del código para crear items (mantener igual)
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
        
        # Preparar items para respuesta (mantener igual)
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
        
        # Respuesta exitosa
        response_data = {
            'id': boleta.id,
            'serie': boleta.serie,
            'correlativo': boleta.correlativo,
            'fecha_emision': localtime(boleta.fecha).strftime('%Y-%m-%d %H:%M:%S'),
            'cliente': {
                'tipo_doc': '1',
                'num_doc': boleta.cliente.cliNumDoc,
                'rzn_social': boleta.cliente.cliNom
            },
            'items': items_response,
            'subtotal': float(boleta.subtotal),
            'igv': float(boleta.igv),
            'total': float(boleta.total),
            'estado': 'pendiente',
            'enviado_sunat': False,
            'mensaje': 'Boleta creada exitosamente. Puede enviarla a SUNAT desde la lista de ventas.'
        }
        
        print(f"Boleta creada exitosamente: {response_data}")
        return JsonResponse(response_data, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        print(f"Error general: {str(e)}")
        return JsonResponse({'error': f'Error interno: {str(e)}'}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
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
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
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

            # Agregar lógica del nombre del CDR
            nombre_cdr = f"R-{boleta.serie}-{boleta.correlativo}.zip" if boleta.enviado_sunat else None

            boletas_data.append({
                'id': boleta.id,
                'serie': boleta.serie,
                'correlativo': boleta.correlativo,
                'fecha_emision': localtime(boleta.fecha).strftime('%Y-%m-%d %H:%M:%S'),
                'cliente': {
                    'tipo_doc': '1',
                    'num_doc': boleta.cliente.cliNumDoc,
                    'rzn_social': boleta.cliente.cliNom
                },
                'items': items,
                'subtotal': float(boleta.subtotal),
                'igv': float(boleta.igv),
                'total': float(boleta.total),
                'estado': boleta.estado,
                'nombre_cdr': nombre_cdr  # ✅ Campo agregado
            })

        return JsonResponse({
            'boletas': boletas_data,
            'total_boletas': len(boletas_data)
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    

# Envia y reenvia
@csrf_exempt
@require_http_methods(["POST"])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
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
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
def descargar_cdr(request, boleta_id):
    try:
        boleta = get_object_or_404(Boleta, id=boleta_id)
        
        if not boleta.nombre_cdr:
            return JsonResponse({
                'error': 'Esta boleta no tiene CDR disponible'
            }, status=404)
        
        # ✅ RUTA AL MICROSERVICIO (no al backend)
        base_dir = Path(settings.BASE_DIR).parent  # Subir un nivel desde backend
        cdr_path = base_dir / 'microservicio-comprobantes' / 'storage' / 'cdr' / boleta.nombre_cdr
        
        print(f"🔍 Buscando CDR en: {cdr_path}")
        print(f"📁 Archivo existe: {cdr_path.exists()}")
        
        # ✅ VERIFICAR si el archivo existe
        if not cdr_path.exists():
            return JsonResponse({
                'error': f'CDR no encontrado: {boleta.nombre_cdr}'
            }, status=404)
        
        # ✅ VERIFICAR tamaño del archivo
        if cdr_path.stat().st_size == 0:
            return JsonResponse({
                'error': 'El archivo CDR está vacío'
            }, status=404)
        
        # ✅ SERVIR el archivo
        response = FileResponse(
            open(cdr_path, 'rb'),
            content_type='application/zip',
            as_attachment=True,
            filename=boleta.nombre_cdr
        )
        
        print(f"✅ CDR servido exitosamente: {boleta.nombre_cdr}")
        return response
        
    except Boleta.DoesNotExist:
        return JsonResponse({'error': 'Boleta no encontrada'}, status=404)
    except Exception as e:
        print(f"❌ Error al descargar CDR: {str(e)}")
        return JsonResponse({
            'error': f'Error interno al descargar CDR: {str(e)}'
        }, status=500)

@api_view(['POST'])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
def registrar_adelanto(request, boleta_id):
    """
    Registra un adelanto/pago parcial para una boleta específica
    """
    try:
        boleta = get_object_or_404(Boleta, id=boleta_id)
        
        # Validar que la boleta no esté anulada
        if boleta.estado == 'anulada':
            return Response(
                {'error': 'No se puede registrar pagos en una boleta anulada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener y validar datos
        monto = Decimal(str(request.data.get('monto', 0)))
        descripcion = request.data.get('descripcion', 'Pago parcial')
        metodo_pago = request.data.get('metodo_pago', 'efectivo')
        
        if monto <= 0:
            return Response(
                {'error': 'El monto debe ser mayor a 0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar que no exceda el saldo pendiente
        saldo_pendiente = boleta.saldo_pendiente
        if monto > saldo_pendiente:
            return Response(
                {'error': f'El monto ({monto}) excede el saldo pendiente ({saldo_pendiente})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear el adelanto
        with transaction.atomic():
            adelanto = PagoAdelanto.objects.create(
                boleta=boleta,
                monto=monto,
                descripcion=descripcion,
                metodo_pago=metodo_pago
            )
            
            # Actualizar estado de la boleta
            boleta.actualizar_estado_pago()
            
            # Serializar respuesta
            adelanto_serializer = PagoAdelantoSerializer(adelanto)
            
            return Response({
                'message': 'Adelanto registrado exitosamente',
                'adelanto': adelanto_serializer.data,
                'boleta_estado': boleta.estado,
                'saldo_pendiente': boleta.saldo_pendiente,
                'esta_pagada_completa': boleta.esta_pagada_completa
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        logger.error(f"Error al registrar adelanto: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
def obtener_adelantos_boleta(request, boleta_id):
    """
    Obtiene todos los adelantos de una boleta específica
    """
    try:
        boleta = get_object_or_404(Boleta, id=boleta_id)
        adelantos = boleta.adelantos.all()
        serializer = PagoAdelantoSerializer(adelantos, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al obtener adelantos: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
def obtener_estado_pago(request, boleta_id):
    """
    Obtiene el estado actual de pago de una boleta
    """
    try:
        boleta = get_object_or_404(Boleta, id=boleta_id)
        
        return Response({
            'total_boleta': boleta.total,
            'monto_adelantos': boleta.monto_adelantos,
            'saldo_pendiente': boleta.saldo_pendiente,
            'esta_pagada_completa': boleta.esta_pagada_completa,
            'estado': boleta.estado
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al obtener estado de pago: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
def procesar_pago_con_verificacion(request, boleta_id):
    """
    Procesa un pago y verifica si debe enviarse automáticamente a SUNAT
    """
    try:
        boleta = get_object_or_404(Boleta, id=boleta_id)
        
        # Validar que la boleta no esté anulada
        if boleta.estado == 'anulada':
            return Response(
                {'error': 'No se puede procesar pagos en una boleta anulada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener datos del pago
        monto = Decimal(str(request.data.get('monto', 0)))
        descripcion = request.data.get('descripcion', 'Pago parcial')
        metodo_pago = request.data.get('metodo_pago', 'efectivo')
        
        if monto <= 0:
            return Response(
                {'error': 'El monto debe ser mayor a 0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Procesar dentro de una transacción
        with transaction.atomic():
            # Registrar el adelanto
            adelanto = PagoAdelanto.objects.create(
                boleta=boleta,
                monto=monto,
                descripcion=descripcion,
                metodo_pago=metodo_pago
            )
            
            # Refrescar datos de la boleta
            boleta.refresh_from_db()
            
            # Verificar si está pagada completamente
            esta_pagada_completa = boleta.esta_pagada_completa
            boleta_completada = False
            enviado_sunat = False
            
            if esta_pagada_completa and boleta.estado != 'enviada':
                boleta_completada = True
                
                # Intentar enviar automáticamente a SUNAT
                try:
                    resultado_sunat = enviar_boleta_sunat_automatico(boleta)
                    if resultado_sunat['success']:
                        boleta.estado = 'enviada'
                        enviado_sunat = True
                    else:
                        boleta.estado = 'pagada'
                        logger.warning(f"Error al enviar boleta {boleta.id} a SUNAT: {resultado_sunat['error']}")
                except Exception as e:
                    logger.error(f"Error en envío automático a SUNAT: {str(e)}")
                    boleta.estado = 'pagada'
            else:
                # Actualizar estado normal
                boleta.actualizar_estado_pago()
            
            boleta.save()
            
            return Response({
                'pago_registrado': True,
                'boleta_completada': boleta_completada,
                'enviado_sunat': enviado_sunat,
                'mensaje': 'Pago procesado exitosamente',
                'estado_boleta': boleta.estado,
                'saldo_pendiente': boleta.saldo_pendiente
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        logger.error(f"Error al procesar pago: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
def eliminar_adelanto(request, boleta_id, adelanto_id):
    """
    Elimina un adelanto específico (solo si la boleta no ha sido enviada)
    """
    try:
        boleta = get_object_or_404(Boleta, id=boleta_id)
        adelanto = get_object_or_404(PagoAdelanto, id=adelanto_id, boleta=boleta)
        
        # Validar que la boleta no esté enviada
        if boleta.estado == 'enviada':
            return Response(
                {'error': 'No se puede eliminar adelantos de una boleta ya enviada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            adelanto.delete()
            boleta.actualizar_estado_pago()
            
            return Response({
                'message': 'Adelanto eliminado exitosamente',
                'estado_boleta': boleta.estado,
                'saldo_pendiente': boleta.saldo_pendiente
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        logger.error(f"Error al eliminar adelanto: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
def obtener_resumen_pagos(request):
    """
    Obtiene un resumen general de los pagos
    """
    try:
        from django.db.models import Count, Sum, Case, When, DecimalField
        
        # Estadísticas generales
        stats = Boleta.objects.exclude(estado='anulada').aggregate(
            total_boletas=Count('id'),
            boletas_pendientes=Count(Case(When(estado='pendiente', then=1))),
            boletas_parciales=Count(Case(When(estado='parcial', then=1))),
            boletas_pagadas=Count(Case(When(estado='pagada', then=1))),
            boletas_enviadas=Count(Case(When(estado='enviada', then=1)))
        )
        
        # Calcular total por cobrar
        boletas_activas = Boleta.objects.exclude(estado__in=['anulada', 'enviada'])
        total_por_cobrar = Decimal('0.00')
        
        for boleta in boletas_activas:
            total_por_cobrar += boleta.saldo_pendiente
        
        return Response({
            'boletas_pendientes': stats['boletas_pendientes'],
            'boletas_parciales': stats['boletas_parciales'],
            'boletas_pagadas': stats['boletas_pagadas'],
            'boletas_enviadas': stats['boletas_enviadas'],
            'total_por_cobrar': total_por_cobrar
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al obtener resumen: {str(e)}")
        return Response(
            {'error': 'Error interno del servidor'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def enviar_boleta_sunat_automatico(boleta):
    """
    Función auxiliar para enviar automáticamente una boleta a SUNAT
    """
    try:
        # Aquí debes implementar tu lógica específica de envío a SUNAT
        # Por ejemplo:
        # - Generar XML
        # - Enviar a webservice de SUNAT
        # - Procesar respuesta
        
        # Ejemplo de implementación ficticia:
        resultado = {
            'success': True,
            'mensaje': 'Boleta enviada exitosamente a SUNAT',
            'codigo_hash': 'ABC123XYZ789',
            'fecha_envio': timezone.now().isoformat()
        }
        
        logger.info(f"Boleta {boleta.id} enviada automáticamente a SUNAT")
        return resultado
        
    except Exception as e:
        logger.error(f"Error en envío automático a SUNAT: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }



# Empleados
# Añadir empleados
@api_view(['POST'])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
#@permission_clases([IsAdminUser])
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

@csrf_exempt
@require_http_methods(["DELETE"])   
def eliminar_boleta(request, boleta_id):
    try:
        boleta = Boleta.objects.get(id=boleta_id)
        boleta.delete()
        return JsonResponse({'mensaje': 'Boleta eliminada correctamente'})
    except Boleta.DoesNotExist:
        return JsonResponse({'error': 'Boleta no encontrada'}, status=404)
    


#para os graficos:
# Las ventas
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def ventas_total(request):
    rango = request.GET.get('rango', 'dia')  # por defecto  día

    if rango == 'dia':
        boletas = (
            Boleta.objects
            .filter(Q(estado='pagada') | Q(estado='enviada'))# cambiar luego para que solo seleccione las pagadas, por ahoar asi 
            .annotate(fecha_dia=TruncDay('fecha'))
            .values('fecha_dia')
            .annotate(total=Sum('total'))
            .order_by('fecha_dia')
        )
        resultado = [{'fecha_dia': b['fecha_dia'].strftime('%Y-%m-%d'), 'total': b['total']} for b in boletas]

    elif rango == 'mes':
        boletas = (
            Boleta.objects
            .filter(Q(estado='pagada') | Q(estado='enviada'))
            .annotate(fecha_mes=TruncMonth('fecha'))
            .values('fecha_mes')
            .annotate(total=Sum('total'))
            .order_by('fecha_mes')
        )
        resultado = [{'fecha_mes': b['fecha_mes'].strftime('%Y-%m'), 'total': b['total']} for b in boletas]

    elif rango == 'anio':
        boletas = (
            Boleta.objects
            .filter(Q(estado='pagada') | Q(estado='enviada'))
            .annotate(fecha_anio=TruncYear('fecha'))
            .values('fecha_anio')
            .annotate(total=Sum('total'))
            .order_by('fecha_anio')
        )
        resultado = [{'fecha_anio': b['fecha_anio'].year, 'total': b['total']} for b in boletas]

    else:
        return Response({'error': 'Rango inválido'}, status=400)

    return Response(resultado)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def resumen_dashboard(request):
    hoy = timezone.localtime(timezone.now()).date()  
    inicio_semana = hoy - timedelta(days=hoy.weekday())
    inicio_mes = hoy.replace(day=1)

    # Boletas del día (estado puede ser 'pagado' si lo tienes definido)
    boletas_dia = Boleta.objects.filter(fecha__date=hoy, estado__in=['pagada', 'enviada'])
    items_dia = ItemBoleta.objects.filter(boleta__in=boletas_dia)

    total_ventas_dia = 0
    ganancia_dia = 0

    for item in items_dia:
        precio_venta = item.valor_unitario
        cantidad = item.cantidad
        total_ventas_dia += precio_venta * cantidad

        costo = 0
        producto = item.content_object

        if producto:
            if hasattr(producto, 'lunaCosto'):
                costo = producto.lunaCosto
            elif hasattr(producto, 'proCosto'):
                costo = producto.proCosto
            # Si no tiene campo de costo, asumimos 0

        ganancia_dia += (precio_venta - costo) * cantidad

    # Filtrar boletas de la semana y del mes
    boletas_semana = Boleta.objects.filter(fecha__date__gte=inicio_semana, estado__in=['pagada', 'enviada'])
    boletas_mes = Boleta.objects.filter(fecha__date__gte=inicio_mes, estado__in=['pagada', 'enviada'])

    total_ventas_semana = boletas_semana.aggregate(suma=Sum('total'))['suma'] or 0
    total_ventas_mes = boletas_mes.aggregate(suma=Sum('total'))['suma'] or 0

    # Crear las fechas de los rangos
    fecha_semana = f"{inicio_semana.strftime('%d de %B')} - {hoy.strftime('%d de %B')}"
    fecha_mes = f"{inicio_mes.strftime('%d de %B')} - {hoy.strftime('%d de %B')}"
    fecha_dia = f"{hoy.strftime('%d de %B')}"

    return Response({
        'ventas_dia_total': float(total_ventas_dia),
        'ganancia_dia': float(ganancia_dia),
        'ventas_semana': float(total_ventas_semana),
        'ventas_mes': float(total_ventas_mes),
        'fecha_semana': fecha_semana,
        'fecha_mes': fecha_mes,
        'fecha_dia': fecha_dia,
    })

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def ultimos_productos_vendidos(request):
    hoy = timezone.localtime(timezone.now()).date()
    
    boletas = Boleta.objects.filter(fecha__date=hoy, estado__in=['pagada', 'enviada']).order_by('-fecha')
    items = ItemBoleta.objects.filter(boleta__in=boletas).select_related('content_type').order_by('-boleta__fecha')
    resultado = []

    for item in items:
        producto = item.content_object
        if producto:
            if hasattr(producto, 'lunaCod'):
                resultado.append({
                    'codigo': producto.lunaCod,
                    'descripcion': str(producto),
                    'tipo': 'Luna',
                    'cantidad': item.cantidad
                })
            elif hasattr(producto, 'monCod'):
                descripcion = f"{producto.monMarca} - {producto.monMate} - {producto.monColor}"
                resultado.append({
                    'codigo': producto.monCod,
                    'descripcion': descripcion,
                    'tipo': 'Montura',
                    'cantidad': item.cantidad
                })
            elif hasattr(producto, 'accCod'):
                descripcion = f"{producto.accNombre} - {producto.proDescrip or 'Sin descripción'}"
                resultado.append({
                    'codigo': producto.accCod,
                    'descripcion': descripcion,
                    'tipo': 'Accesorio',
                    'cantidad': item.cantidad
                })
        else:
            # Si es producto personalizado
            resultado.append({
                'codigo': 'PERSONALIZADO',
                'descripcion': item.descripcion_personalizada or 'Producto personalizado',
                'tipo': 'Personalizado',
                'cantidad': item.cantidad
            })

    return Response(resultado)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def boletas_pendientes(request):
    boletas = Boleta.objects.filter(estado='pendiente').order_by('-fecha')
    data = []

    for b in boletas:
        data.append({
            'cliente': b.cliente.cliNom if b.cliente and hasattr(b.cliente, 'cliNom') else 'Cliente no registrado',
            'fecha': b.fecha.strftime('%d/%m/%Y'),
            'total': float(b.total)
        })

    return Response(data)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def top_clientes_frecuentes(request):
    clientes = (
        Boleta.objects
        .filter(cliente__isnull=False, estado__in=['pagada', 'enviada'])
        .values('cliente__id', 'cliente__cliNom', 'cliente__cliDni')
        .annotate(total_compras=Count('id'))
        .order_by('-total_compras')[:6]
    )

    resultado = [
        {
            'nombre': cliente['cliente__cliNom'],
            'dni': cliente['cliente__cliDni'],
            'compras': cliente['total_compras'],
        }
        for cliente in clientes
    ]

    return Response(resultado)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def productos_dia_detalle(request):
    hoy = timezone.localtime(timezone.now()).date()

    boletas_dia = Boleta.objects.filter(fecha__date=hoy, estado__in=['pagada', 'enviada'])
    items = ItemBoleta.objects.filter(boleta__in=boletas_dia)

    productos = []

    for item in items:
        producto = item.content_object
        if not producto:
            continue

        nombre = str(producto)
        tipo = ''
        codigo = ''

        if hasattr(producto, 'lunaCod'):
            tipo = 'Luna'
            codigo = producto.lunaCod
        elif hasattr(producto, 'monCod'):
            tipo = 'Montura'
            codigo = producto.monCod
        elif hasattr(producto, 'accCod'):
            tipo = 'Accesorio'
            codigo = producto.accCod

        productos.append({
            'codigo': codigo,
            'nombre': nombre,
            'tipo': tipo,
            'cantidad': item.cantidad,
            'precio_unitario': float(item.valor_unitario),
            'subtotal': float(item.valor_unitario * item.cantidad)
        })

    return Response({
        'fecha': hoy.strftime('%Y-%m-%d'),
        'productos_vendidos': productos
    })
