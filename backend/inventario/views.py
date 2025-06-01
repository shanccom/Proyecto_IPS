import json
from django.http import JsonResponse

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from .models import Montura, Luna, Accesorio
from .serializers import MonturaSerializer, LunaSerializer, AccesorioSerializer

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
        lunas = LunaSerializer(Luna.objects.all(), many=True).data
        accesorios = AccesorioSerializer(Accesorio.objects.all(), many=True).data
        return Response(monturas + lunas + accesorios)

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
def obtener_opciones_filtros(request):
    tipos = ['Montura', 'Luna', 'Accesorio']

    marcas = list(Montura.objects.values_list('monMarca', flat=True).distinct())
    materiales = list(Montura.objects.values_list('monMate', flat=True).distinct()) + \
                 list(Luna.objects.values_list('lunaMat', flat=True).distinct())

    colores = list(Luna.objects.values_list('lunaColorHalo', flat=True).distinct())

    estados = ['Vendido', 'No vendido']  # Puedes ajustar según tus datos

    return Response({
        'tipos': tipos,
        'marcas': marcas,
        'materiales': list(set(materiales)),
        'colores': list(set(colores)),
        'estados': estados
    })

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
def crear_luna(request):
    if request.method == 'POST':
        data = json.loads(request.body) 
        
        luna = Luna(
            proNombre=data['proNombre'],
            proCosto=data['proCosto'],
            proPrecioVenta=data['proPrecioVenta'],
            lunaProp=data['lunaProp'],
            lunaMat=data['lunaMat'],
            lunaColorHalo=data['lunaColorHalo'],
            proTipo='Luna'
        )
        luna.save()  
        
        return JsonResponse({'mensaje': 'Luna guardada correctamente'})
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

