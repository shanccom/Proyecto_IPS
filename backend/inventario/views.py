import json
from django.http import JsonResponse

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from .models import Montura, Accesorio
from .serializers import MonturaSerializer, AccesorioSerializer

from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
#Eliminar inventario solo para miembros del staff

#todo
class ProductosView(APIView):
    #authentication_classes = [TokenAuthentication]
    #permission_classes = [IsAuthenticated]
    def get(self, request):
        monturas = MonturaSerializer(Montura.objects.all(), many=True).data
        accesorios = AccesorioSerializer(Accesorio.objects.all(), many=True).data
        return Response(monturas + accesorios)

#Add new product Montura
@api_view(["POST"])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])

def new_product_montura(request):
    marca = request.data.get('Marca_montura')
    publico= request.data.get('Publico_dirigo_montura')
    material = request.data.get('Material_montura')
    color = request.data.get('Color_montura')
    costo = request.data.get('Costo_montura')
    precio_venta = request.data.get('Precio_montura')
    vendido = request.data.get('Vendido')
    if not marca or not publico or not material:
            return Response({"error": "Faltan datos necesarios para crear la publicacion"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        Montura = Montura.objects.create(
            marca = marca,
            publico = publico,
            material = material,
            color = color,
            costo = costo,
            precio = precio_venta,
            vendido = vendido 
        )
        serializer = MonturaSerializer(Montura)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
#Get product with de code
@api_view(["GET"])
#@authentication_classes([TokenAuthentication])
#@permission_classes([IsAuthenticated])
def search(request):
    codigo = request.query_params.get("codigo")
        
    # Buscar en cada modelo
    montura = Montura.objects.filter(monCod=codigo).first()
    if montura:
        return Response(MonturaSerializer(montura).data)
    accesorio = Accesorio.objects.filter(accCod=codigo).first()
    if accesorio:
        return Response(AccesorioSerializer(accesorio).data)

    return Response({"message": "Producto no encontrado"}, status=404)


@api_view(['GET'])
def obtener_filtros_montura(request):
    montura_min = Montura.objects.all().order_by('proPrecioVenta').first()
    montura_max = Montura.objects.all().order_by('-proPrecioVenta').first()

    filtros = {
        'marcas': [m[0] for m in Montura.MARCAS_CHOICES],
        'publicos': [p[0] for p in Montura.PUBLICO_CHOICES],
        'materiales': [m[0] for m in Montura.MATERIAL_CHOICES],
        'colores': [c[0] for c in Montura.COLOR_CHOICES],
        'precio_min': montura_min.proPrecioVenta if montura_min else 0,  # Valor predeterminado si no hay monturas
        'precio_max': montura_max.proPrecioVenta if montura_max else 0,  # Valor predeterminado si no hay monturas
    }
    
    return Response(filtros)

@api_view(['GET'])
def obtener_filtros_accesorio(request):
    queryset = Accesorio.objects.all()
    if queryset.exists():
        filtros = {
            'precio_min': queryset.order_by('proPrecioVenta').first().proPrecioVenta,
            'precio_max': queryset.order_by('-proPrecioVenta').first().proPrecioVenta,
        }
    else:
        filtros = {
            'precio_min': 0,
            'precio_max': 0,
        }
    return Response(filtros)

@csrf_exempt
def crear_montura(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        m = Montura(
            #proNombre=data['proNombre'],
            proCosto=data['proCosto'],
            proPrecioVenta=data['proPrecioVenta'],
            monMarca=data['monMarca'],
            monMate=data['monMate'],
            monPubl=data['monPubl'],
            monColor=data['monColor'],
            monVendida= data['monVendida']
        )
        m.save()
        return JsonResponse({'mensaje': 'Montura guardada'})
    
@csrf_exempt
def crear_accesorio(request):
    if request.method == 'POST':
        data = json.loads(request.body) 
        
        accesorio = Accesorio(
            proNombre=data['proNombre'],
            proCosto=data['proCosto'],
            proPrecioVenta=data['proPrecioVenta'],
            accDescrip=data.get('accDescrip', ''),
            proTipo='Accesorio'
        )
        accesorio.save()
        
        return JsonResponse({'mensaje': 'Accesorio guardado correctamente'})

