from django.shortcuts import render
from rest_framework import generics
from .models import Cliente, Receta
from .serializers import ClienteSerializer, RecetaSerializer
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import datetime
from decimal import Decimal, InvalidOperation

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

    print(request.data)
    recCod = request.data.get('recCod')
    cliCod = request.data.get('cliCod')
    
    rectOpt = request.data.get('rectOpt', False) 
    fecha_str = request.data.get('recfecha')  
    if fecha_str:
        try:
            recfecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()  # Convertir a un objeto `date`
        except ValueError:
            return Response({"error": "Fecha no válida"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        recfecha = datetime.now().date()

    if not cliCod:
        return Response({"error": "Debe proporcionar un cliCod válido"}, status=status.HTTP_400_BAD_REQUEST)

    cliente = get_object_or_404(Cliente, cliCod=cliCod)  # Verifica si el cliente existe

    recOD_sph = safe_decimal(request.data.get('recOD_sph'))
    recOD_cyl = safe_decimal(request.data.get('recOD_cyl'))
    recOD_eje = safe_decimal(request.data.get('recOD_eje'))

    recOI_sph = safe_decimal(request.data.get('recOI_sph'))
    recOI_cyl = safe_decimal(request.data.get('recOI_cyl'))
    recOI_eje = safe_decimal(request.data.get('recOI_eje'))

    recDIPLejos = safe_decimal(request.data.get('recDIPLejos'))
    recDIPCerca = safe_decimal(request.data.get('recDIPCerca'))
    rec_adicion = safe_decimal(request.data.get('rec_adicion'))

    recObsAdic = request.data.get('recObsAdic')
    if recObsAdic is not None:
        recObsAdic = str(recObsAdic)

    try:
        receta = Receta.objects.create(
            cliCod=cliente,
            rectOpt=rectOpt,
            recfecha=recfecha,
            recOD_sph=recOD_sph,
            recOD_cyl=recOD_cyl,
            recOD_eje=recOD_eje,
            recOI_sph=recOI_sph,
            recOI_cyl=recOI_cyl,
            recOI_eje=recOI_eje,
            recDIPLejos=recDIPLejos,
            recDIPCerca=recDIPCerca,
            rec_adicion=rec_adicion,
            recObsAdic=recObsAdic,
        )
        receta.save() 

        serializer = RecetaSerializer(receta)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

def safe_decimal(value):
    try:
        if value is not None and value != '':
            return Decimal(str(value))
    except InvalidOperation:
        print(f"Valor inválido para Decimal: {value!r}")
        raise
    return None

@api_view(['PUT'])
def update_receta(request, codigo):
    
    try:
        receta = Receta.objects.get(recCod=codigo)
        print("Instancia a actualizar:", receta)
        print("Datos nuevos:", request.data)

    except Receta.DoesNotExist:
        return Response({"error": "Receta no encontrada"}, status=status.HTTP_404_NOT_FOUND)

    try:
        # Asignar manualmente los valores
        receta.rectOpt = request.data.get('rectOpt', receta.rectOpt)
        receta.recfecha = request.data.get('recfecha', receta.recfecha)

        receta.recOD_sph = safe_decimal(request.data.get('recOD_sph'))
        receta.recOD_cyl = safe_decimal(request.data.get('recOD_cyl'))
        receta.recOD_eje = safe_decimal(request.data.get('recOD_eje'))

        receta.recOI_sph = safe_decimal(request.data.get('recOI_sph'))
        receta.recOI_cyl = safe_decimal(request.data.get('recOI_cyl'))
        receta.recOI_eje = safe_decimal(request.data.get('recOI_eje'))

        receta.recDIPLejos = safe_decimal(request.data.get('recDIPLejos'))
        receta.recDIPCerca = safe_decimal(request.data.get('recDIPCerca'))
        receta.rec_adicion = safe_decimal(request.data.get('rec_adicion'))
        
        receta.save()

        serializer = RecetaSerializer(receta)
        print("Receta actualizada:", serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": f"Error al actualizar la receta: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

#RECUPERARR recetas de un cliente
@api_view(['GET'])
def recetas_cliente(request):
    codigo_cliente = request.query_params.get('nombre_cliente', None)  
    if codigo_cliente:

        try:
            cliente = Cliente.objects.filter(cliCod=codigo_cliente).first()
            if not cliente:
                return Response({"error": "Cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
            recetas = Receta.objects.filter(cliCod=cliente.cliCod)
            serializer = RecetaSerializer(recetas, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({"error": "Debe proporcionar el codigo del cliente"}, status=status.HTTP_400_BAD_REQUEST)

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