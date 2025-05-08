from rest_framework import serializers
from .models import Venta, DetalleVenta
from productos.models import Accesorio, Montura, Luna

class VentaSerializer(serializers.ModelSerializer):
    detalles = serializers.ListField(child=serializers.DictField())

    class Meta:
        model = Venta
        fields = ['cliente', 'detalles']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')  # Extrae los detalles de la venta
        venta = Venta.objects.create(**validated_data)

        total_venta = 0
        for detalle_data in detalles_data:
            tipo_producto = detalle_data['tipo_producto']
            cantidad = detalle_data['cantidad']

            if tipo_producto == 'accesorio':
                producto = Accesorio.objects.get(id=detalle_data['producto_accesorio'])
                precio_unitario = producto.precio
            elif tipo_producto == 'montura':
                producto = Montura.objects.get(id=detalle_data['producto_montura'])
                precio_unitario = producto.precio
            elif tipo_producto == 'luna':
                producto = Luna.objects.get(id=detalle_data['producto_luna'])
                precio_unitario = producto.precio

            total_producto = cantidad * precio_unitario
            DetalleVenta.objects.create(
                venta=venta,
                tipo_producto=tipo_producto,
                cantidad=cantidad,
                precio_unitario=precio_unitario,
                total=total_producto,
                **detalle_data
            )
            total_venta += total_producto

        venta.total = total_venta
        venta.save()

        return venta