from rest_framework import serializers
from .models import Montura, Luna, Accesorio


class MonturaSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(source='monCod')
    tipo = serializers.CharField(default='Montura')
    marca = serializers.CharField(source='monMarca')
    material = serializers.CharField(source='monMate')
    color = serializers.CharField(default="--")
    precio = serializers.DecimalField(source='proCosto', max_digits=10, decimal_places=2)
    estado = serializers.DecimalField(source='proPrecioVenta', max_digits=10, decimal_places=2)

    class Meta:
        model = Montura
        fields = ['codigo', 'tipo', 'marca', 'material', 'color', 'precio', 'estado']


class LunaSerializer(serializers.ModelSerializer):
    codigo = serializers.IntegerField(source='lunaCod')
    tipo = serializers.CharField(source='lunaProp')
    material = serializers.CharField(source='lunaMat')
    color = serializers.CharField(source='lunaColorHalo', default="--")
    precio = serializers.DecimalField(source='proCosto', max_digits=10, decimal_places=2)
    estado = serializers.DecimalField(source='proPrecioVenta', max_digits=10, decimal_places=2)

    class Meta:
        model = Luna
        fields = ['codigo', 'tipo', 'material', 'color', 'precio', 'estado']


class AccesorioSerializer(serializers.ModelSerializer):
    codigo = serializers.IntegerField(source='accCod')
    tipo = serializers.CharField(default="Accesorio")
    material = serializers.CharField(default="--")
    color = serializers.CharField(default="--")
    precio = serializers.DecimalField(source='proCosto', max_digits=10, decimal_places=2)
    estado = serializers.DecimalField(source='proPrecioVenta', max_digits=10, decimal_places=2)
    descripcion = serializers.CharField(source='accDescrip')

    class Meta:
        model = Accesorio
        fields = ['codigo', 'tipo', 'material', 'color', 'precio', 'estado', 'descripcion']
