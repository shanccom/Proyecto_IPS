from rest_framework import serializers
from .models import Accesorio, Montura, Luna

class AccesorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accesorio
        fields = '__all__'

class MonturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Montura
        fields = '__all__'

class LunaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Luna
        fields = '__all__'
