from rest_framework import serializers
from .models import Montura, Accesorio


class MonturaSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(source='proCod')
    nombre = serializers.CharField(source='proNombre')
    tipo = serializers.CharField(source='proTipo')
    marca = serializers.CharField(source='monMarca')
    material = serializers.CharField(source='monMate')
    color = serializers.CharField(default="--")
    precio = serializers.DecimalField(source='proCosto', max_digits=10, decimal_places=2)
    estado = serializers.CharField(source='proPrecioVenta', default="Disponible")

    class Meta:
        model = Montura
        fields = ['codigo', 'tipo', 'marca', 'publico', 'material', 'color', 'costo', 'precio', 'vendido']

class AccesorioSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(source='proCod')
    nombre = serializers.CharField(source='proNombre')
    tipo = serializers.CharField(source='proTipo') 
    material = serializers.CharField(default="--")
    color = serializers.CharField(default="--")
    precio = serializers.DecimalField(source='proCosto', max_digits=10, decimal_places=2)
    estado = serializers.CharField(source='proPrecioVenta', default="Disponible")
    descripcion = serializers.CharField(source='accDescrip')

    class Meta:
        model = Accesorio
        fields = ['codigo','tipo', 'material', 'color', 'precio', 'estado', 'descripcion']
