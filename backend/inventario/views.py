from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from .models import Montura, Luna, Accesorio
from .serializers import MonturaSerializer, LunaSerializer, AccesorioSerializer

# Create your views here.


#todo
class ProductosView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        monturas = MonturaSerializer(Montura.objects.all(), many=True).data
        lunas = LunaSerializer(Luna.objects.all(), many=True).data
        accesorios = AccesorioSerializer(Accesorio.objects.all(), many=True).data
        return Response(monturas + lunas + accesorios)
#Add new product Montura
@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])

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
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def search(request):
    codigo = request.query_params.get("codigo")
    
    # Buscar en cada modelo
    montura = Montura.objects.filter(monCod=codigo).first()
    if montura:
        return Response(MonturaSerializer(montura).data)
    
    luna = Luna.objects.filter(lunaCod=codigo).first()
    if luna:
        return Response(LunaSerializer(luna).data)

    accesorio = Accesorio.objects.filter(accCod=codigo).first()
    if accesorio:
        return Response(AccesorioSerializer(accesorio).data)

    return Response({"message": "Producto no encontrado"}, status=404)