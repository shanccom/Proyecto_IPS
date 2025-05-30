from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Montura, Luna, Accesorio
from .serializers import MonturaSerializer, LunaSerializer, AccesorioSerializer
from rest_framework.decorators import api_view
# Create your views here.

class ProductosView(APIView):
    def get(self, request):
        monturas = MonturaSerializer(Montura.objects.all(), many=True).data
        lunas = LunaSerializer(Luna.objects.all(), many=True).data
        accesorios = AccesorioSerializer(Accesorio.objects.all(), many=True).data
        return Response(monturas + lunas + accesorios)

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