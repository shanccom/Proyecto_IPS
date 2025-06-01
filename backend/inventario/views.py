import json
from django.http import JsonResponse

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Montura, Luna, Accesorio
from .serializers import MonturaSerializer, LunaSerializer, AccesorioSerializer
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
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

@csrf_exempt
def crear_montura(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        m = Montura(
            proNombre=data['proNombre'],
            proCosto=data['proCosto'],
            proPrecioVenta=data['proPrecioVenta'],
            monMarca=data['monMarca'],
            monMate=data['monMate'],
            monPubl=data['monPubl'],
            proTipo=data['proTipo']
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