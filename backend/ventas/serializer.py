from rest_framework import serializers
from .models import Empleado, Venta, DetalleVentaMontura, DetalleVentaLuna, DetalleVentaAccesorio, BoletaElectronica

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = [
            'emplCod', 'emplNom', 'emplCarg', 'empUsua', 'empContr', 'empCond'
        ]

    def validate_empContr(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("La contraseña debe tener al menos 6 caracteres.")
        return value


class DetalleVentaMonturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVentaMontura
        fields = [
            'id', 'ventNum', 'proCod', 'detVenCantidad', 'detVenValorUni', 'detVenSubtotal', 'detVenDescr'
        ]

    def validate(self, data):
        if data['detVenCantidad'] <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        if data['detVenValorUni'] <= 0:
            raise serializers.ValidationError("El valor unitario debe ser mayor a 0.")
        return data


class DetalleVentaLunaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVentaLuna
        fields = [
            'id', 'ventNum', 'proCod', 'detVenCantidad', 'detVenValorUni', 'detVenSubtotal', 'detVenDescr'
        ]

    def validate(self, data):
        if data['detVenCantidad'] <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        if data['detVenValorUni'] <= 0:
            raise serializers.ValidationError("El valor unitario debe ser mayor a 0.")
        return data


class DetalleVentaAccesorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVentaAccesorio
        fields = [
            'id', 'ventNum', 'proCod', 'detVenCantidad', 'detVenValorUni', 'detVenSubtotal', 'detVenDescr'
        ]

    def validate(self, data):
        if data['detVenCantidad'] <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        if data['detVenValorUni'] <= 0:
            raise serializers.ValidationError("El valor unitario debe ser mayor a 0.")
        return data


class VentaSerializer(serializers.ModelSerializer):
    monto_total = serializers.SerializerMethodField()

    class Meta:
        model = Venta
        fields = [
            'ventNum', 'cliCod', 'empCod', 'venFecha', 'venTipoPago', 'venEstado', 'venSaldoRes', 'monto_total'
        ]

    def get_monto_total(self, obj):
        monturas = DetalleVentaMontura.objects.filter(ventNum=obj)
        lunas = DetalleVentaLuna.objects.filter(ventNum=obj)
        accesorios = DetalleVentaAccesorio.objects.filter(ventNum=obj)

        total = sum(item.detVenCantidad * item.detVenValorUni for item in monturas)
        total += sum(item.detVenCantidad * item.detVenValorUni for item in lunas)
        total += sum(item.detVenCantidad * item.detVenValorUni for item in accesorios)
        return total

    def validate(self, data):
        if data['venTipoPago'] == 'Credito' and (data.get('venSaldoRes') is None or data['venSaldoRes'] <= 0):
            raise serializers.ValidationError("Para crédito, debe haber un saldo restante positivo.")
        return data


class BoletaElectronicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoletaElectronica
        fields = [
            'boletNum', 'ventNum', 'boletSerie', 'boletCorrelat', 'boleFech',
            'boleTipoDoc', 'boleEstadoEnvio'
        ]

    def validate(self, data):
        venta = data['ventNum']
        if venta.venEstado != 'Cancelado':
            boleEstadoEnvio = 'N'
        return data

    def validate_boleFech(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("La fecha no puede estar en el futuro.")
        return value
