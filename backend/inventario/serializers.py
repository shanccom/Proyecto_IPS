from rest_framework import serializers
from .models import Montura, Luna, Accesorio

class MonturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Montura
        fields = '__all__'

class LunaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Luna
        fields = '__all__'

class AccesorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accesorio
        fields = '__all__'
