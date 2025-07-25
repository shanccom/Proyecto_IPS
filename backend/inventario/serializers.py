from rest_framework import serializers
from .models import Montura, Accesorio


class MonturaSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(source='monCod')
    marca = serializers.CharField(source='monMarca')
    publico = serializers.CharField(source='monPubl')
    material = serializers.CharField(source='monMate')
    color = serializers.CharField(source='monColor')
    costo = serializers.DecimalField(source='proCosto', max_digits=10, decimal_places=2)
    precio = serializers.DecimalField(source='proPrecioVenta', max_digits=10, decimal_places=2)
    vendido = serializers.BooleanField(source='monVendida')
    descripcion = serializers.CharField(source='proDescrip', default="")
    stock = serializers.IntegerField(source='proStock')
    tipo = serializers.SerializerMethodField() 

    # Si quieres un campo estado calculado basado en si está vendido o no
    estado = serializers.SerializerMethodField()

    def get_tipo(self, obj):                    # Aquí
        return "montura"
    
    def get_estado(self, obj):
        return "Vendido" if obj.monVendida else "Disponible"

    class Meta:
        model = Montura
        fields = ['codigo', 'marca', 'publico', 'material', 'color', 'costo', 'precio', 'vendido', 'descripcion', 'estado', 'stock', 'tipo']


class AccesorioSerializer(serializers.ModelSerializer): 
    codigo = serializers.CharField(source='accCod')
    nombre = serializers.CharField(source='accNombre')
    costo = serializers.DecimalField(source='proCosto', max_digits=10, decimal_places=2)
    precio = serializers.DecimalField(source='proPrecioVenta', max_digits=10, decimal_places=2)
    descripcion = serializers.CharField(source='proDescrip', default="")
    
    # Campos por defecto para mantener consistencia con Montura
    material = serializers.CharField(default="--")
    color = serializers.CharField(default="--")
    estado = serializers.CharField(default="Disponible")
    tipo = serializers.SerializerMethodField() 

    def get_tipo(self, obj):                  
        return "accesorio"

    class Meta:
        model = Accesorio
        fields = ['codigo', 'nombre', 'material', 'color', 'costo', 'precio', 'descripcion', 'estado', 'tipo']