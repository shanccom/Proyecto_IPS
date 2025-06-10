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
        print(f"Datos recibidos: {data}")  # Debug
        
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
        
        # Crear la boleta
        boleta = Boleta.objects.create(
            serie=data['serie'],
            correlativo=correlativo,
            cliente=cliente,
            subtotal=Decimal(str(data['subtotal'])),
            igv=Decimal(str(data['igv'])),
            total=Decimal(str(data['total']))
        )
        
        # Crear los items de la boleta
        for item_data in data['items']:
            try:
                print(f"Procesando item: {item_data}")  # Debug
                
                # Buscar el producto por código
                codigo_producto = item_data.get('producto_id')
                if not codigo_producto:
                    boleta.delete()
                    return JsonResponse({
                        'error': 'Código de producto es requerido para cada item'
                    }, status=400)
                
                # Buscar producto en todos los modelos disponibles
                producto, content_type, precio = buscar_producto(codigo_producto)
                
                if not producto:
                    boleta.delete()
                    return JsonResponse({
                        'error': f'Producto con código {codigo_producto} no encontrado en ningún modelo'
                    }, status=404)
                
                # Validar cantidad
                cantidad = item_data.get('cantidad', 1)
                if cantidad <= 0:
                    boleta.delete()
                    return JsonResponse({
                        'error': 'La cantidad debe ser mayor a 0'
                    }, status=400)
                
                # Validar valor unitario
                valor_unitario = item_data.get('valor_unitario')
                if not valor_unitario or valor_unitario <= 0:
                    boleta.delete()
                    return JsonResponse({
                        'error': 'El valor unitario debe ser mayor a 0'
                    }, status=400)
                
                # Crear item de boleta usando el ID primario del producto encontrado
                ItemBoleta.objects.create(
                    boleta=boleta,
                    content_type=content_type,
                    object_id=producto.pk,  # Usar el ID primario del producto
                    cantidad=cantidad,
                    valor_unitario=Decimal(str(valor_unitario))
                )
                
                print(f"Item creado para producto: {producto} (Tipo: {content_type.model})")  # Debug
                
            except Exception as e:
                print(f"Error al procesar item: {str(e)}")  # Debug
                boleta.delete()
                return JsonResponse({
                    'error': f'Error al procesar item: {str(e)}'
                }, status=500)
        
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
            'subtotal': float(boleta.subtotal),
            'igv': float(boleta.igv),
            'total': float(boleta.total),
            'estado': 'pendiente'
        }
        
        print(f"Boleta creada exitosamente: {response_data}")  # Debug
        return JsonResponse(response_data, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Datos JSON inválidos'
        }, status=400)
    except Exception as e:
        print(f"Error general: {str(e)}")  # Debug
        import traceback
        traceback.print_exc()  # Debug completo
        return JsonResponse({
            'error': f'Error interno: {str(e)}'
        }, status=500)

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
        

