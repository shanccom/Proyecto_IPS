from django.shortcuts import render
from rest_framework import generics
from .models import Cliente, Receta
from .serializers import ClienteSerializer, RecetaSerializer
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404


class ClienteListCreateView(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class ClienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class RecetaListCreateView(generics.ListCreateAPIView):
    queryset = Receta.objects.all()
    serializer_class = RecetaSerializer

class RecetaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Receta.objects.all()
    serializer_class = RecetaSerializer
    
@api_view(['POST'])
def create_receta(request):
    recCod = request.data.get('recCod')
    cliCod = request.data.get('cliCod')
    
    if not cliCod:
        return Response({"error": "Debe proporcionar un cliCod válido"}, status=status.HTTP_400_BAD_REQUEST)

    cliente = get_object_or_404(Cliente, cliCod=cliCod)  # Verifica si el cliente existe

    try:
        receta = Receta.objects.create(
            recCod=recCod,
            cliCod=cliente,
            rectOpt=request.data.get('rectOpt'),
            recFecha=request.data.get('recFecha'),
            recOD_sph=request.data.get('recOD_sph'),
            recOD_cyl=request.data.get('recOD_cyl'),
            recOD_eje=request.data.get('recOD_eje'),
            recOI_sph=request.data.get('recOI_sph'),
            recOI_cyl=request.data.get('recOI_cyl'),
            recOI_eje=request.data.get('recOI_eje'),
            recDIPLejos=request.data.get('recDIPLejos'),
            recDIPCerca=request.data.get('recDIPCerca'),
            rec_adicion=request.data.get('rec_adicion'),
            recObsAdic=request.data.get('recObsAdic'),
        )

        serializer = RecetaSerializer(receta)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#RECUPERARR recetas de un cliente
@api_view(['GET'])
def recetas_cliente(request):
    nombre_cliente = request.query_params.get('nombre_cliente', None)
    try:
        cliente = Cliente.objects.filter(nombre__icontains=nombre_cliente).first()
        if not cliente:
            return Response({"error": "Cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        recetas = Receta.objects.filter(cliCod=cliente.cliCod)
        serializer = RecetaSerializer(recetas,many=True).data
        return Response(serializer)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def obtener_clientes(request):
    try:
        clientes = Cliente.objects.all()
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def crear_cliente(request):
    if request.method == 'POST':
        serializer = ClienteSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)