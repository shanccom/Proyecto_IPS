from rest_framework import viewsets
from .models import Accesorio, Montura, Luna
from .serializers import AccesorioSerializer, MonturaSerializer, LunaSerializer

class AccesorioViewSet(viewsets.ModelViewSet):
    queryset = Accesorio.objects.all()
    serializer_class = AccesorioSerializer

class MonturaViewSet(viewsets.ModelViewSet):
    queryset = Montura.objects.all()
    serializer_class = MonturaSerializer

class LunaViewSet(viewsets.ModelViewSet):
    queryset = Luna.objects.all()
    serializer_class = LunaSerializer
