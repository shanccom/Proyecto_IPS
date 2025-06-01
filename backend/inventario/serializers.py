from rest_framework import serializers
from .models import Montura, Luna, Accesorio


class MonturaSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(source='monCod')
    tipo = serializers.CharField(default='Montura')
    marca = serializers.CharField(source='monMarca')
    publico = serializers.CharField(source='monPubl')
    material = serializers.CharField(source='monMate')
    color = serializers.CharField(source='monColor')
    costo = serializers.DecimalField(source='proCosto', max_digits=10, decimal_places=2)
    precio = serializers.DecimalField(source='proPrecioVenta', max_digits=10, decimal_places=2)
    vendido = serializers.BooleanField(source='monVendida')  

    class Meta:
        model = Montura
        fields = ['codigo', 'tipo', 'marca', 'material', 'color', 'costo', 'precio', 'vendido']


class LunaSerializer(serializers.ModelSerializer):
    codigo = serializers.IntegerField(source='lunaCod')
    tipo = serializers.CharField(source='lunaProp')
    material = serializers.CharField(source='lunaMat')
    color_halo = serializers.CharField(source='lunaColorHalo', default="--")
    precio = serializers.DecimalField(source='proCosto', max_digits=10, decimal_places=2)
    estado = serializers.DecimalField(source='proPrecioVenta', max_digits=10, decimal_places=2)

    class Meta:
        model = Luna
        fields = ['codigo', 'tipo', 'material', 'color_halo', 'precio', 'estado']


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
