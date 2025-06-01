from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Cliente, Luna
from .serializers import ClienteSerializer, LunaSerializer

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