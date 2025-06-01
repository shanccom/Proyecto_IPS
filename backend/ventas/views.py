from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Cliente, Luna
from .serializers import ClienteSerializer, LunaSerializer, BoletaElectronicaSerializers
from .

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class LunaViewSet(viewsets.ModelViewSet):
    queryset = Luna.objects.all()
    serializer_class = LunaSerializer

    @action(detail=False, methods=['get'])
    def opciones(self, request):
        """Obtener las opciones disponibles para los campos de selección"""
        return Response({
            'propiedades': Luna.LUNA_CHOICES,
            'materiales': Luna.MATERIALLUNA_CHOICES,
            'colores_halo': Luna.HALO_CHOICES
        })

#Comentarios = crear empleados y eliminar empleados solo a miembros del staff
#Eliminar ventas solo miembros de staff
#El resto de Views

class BoletaElectronicaCreateView(APIView):
    def post(self, request):
        serializer = BoletaElectronicaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
