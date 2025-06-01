from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from .models import Montura, Luna, Accesorio
from .serializers import MonturaSerializer, LunaSerializer, AccesorioSerializer

# Create your views here.



class ProductosView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        monturas = MonturaSerializer(Montura.objects.all(), many=True).data
        lunas = LunaSerializer(Luna.objects.all(), many=True).data
        accesorios = AccesorioSerializer(Accesorio.objects.all(), many=True).data
        return Response(monturas + lunas + accesorios)

#Recuperar producto por codigo busqueda
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