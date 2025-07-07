from rest_framework import serializers
from .models import Cliente, Luna, ItemBoleta, Boleta, Empleado, PagoAdelanto

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = ['emplCod', 'emplNom', 'emplCarg', 'emplCond']
        
class LunaSerializer(serializers.ModelSerializer):
    # Campos para mostrar las opciones legibles
    lunaProp_display = serializers.CharField(source='get_lunaProp_display', read_only=True)
    lunaMat_display = serializers.CharField(source='get_lunaMat_display', read_only=True)
    lunaColorHalo_display = serializers.CharField(source='get_lunaColorHalo_display', read_only=True)
    
    class Meta:
        model = Luna
        fields = '__all__'
        read_only_fields = ('lunaCod',)

class ItemBoletaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemBoleta
        fields = ['content_type', 'object_id', 'cantidad', 'valor_unitario']

class PagoAdelantoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PagoAdelanto
        fields = ['id', 'boleta', 'monto', 'fecha_pago', 'descripcion', 'metodo_pago']
        read_only_fields = ['id']

class BoletaSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer()
    items = ItemBoletaSerializer(many=True)
    monto_adelantos = serializers.ReadOnlyField()
    saldo_pendiente = serializers.ReadOnlyField()
    esta_pagada_completa = serializers.ReadOnlyField()
    adelantos = PagoAdelantoSerializer(many=True, read_only=True)

    class Meta:
        model = Boleta
        fields = ['serie', 'correlativo', 'fecha_emision', 'cliente', 
          'items', 'subtotal', 'igv', 'total', 'estado', 'url_pdf', 
          'nombre_cdr', 'monto_adelantos', 'saldo_pendiente', 
          'esta_pagada_completa', 'adelantos']

    def create(self, validated_data):
        cliente_data = validated_data.pop('cliente')
        items_data = validated_data.pop('items')

        # Obtener o crear cliente
        cliente, _ = Cliente.objects.get_or_create(
            num_doc=cliente_data['num_doc'],
            defaults=cliente_data
        )

        boleta = Boleta.objects.create(cliente=cliente, **validated_data)

        for item_data in items_data:
            producto = item_data['producto']
            cantidad = item_data['cantidad']
            if producto.stock < cantidad:
                raise serializers.ValidationError(f"Stock insuficiente para {producto.nombre}")
            producto.stock -= cantidad
            producto.save()
            ItemBoleta.objects.create(boleta=boleta, **item_data)

        return boleta
    
