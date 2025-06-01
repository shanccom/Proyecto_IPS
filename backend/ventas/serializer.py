from rest_framework import serializers
from .models import Cliente, Luna

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class LunaSerializer(serializers.ModelSerializer):
    # Campos para mostrar las opciones legibles
    lunaProp_display = serializers.CharField(source='get_lunaProp_display', read_only=True)
    lunaMat_display = serializers.CharField(source='get_lunaMat_display', read_only=True)
    lunaColorHalo_display = serializers.CharField(source='get_lunaColorHalo_display', read_only=True)
    
    class Meta:
        model = Luna
        fields = '__all__'
        read_only_fields = ('lunaCod',)