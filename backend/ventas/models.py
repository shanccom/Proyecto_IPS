from django.db import models
from cliente.models import Cliente
from django.utils import timezone
from inventario.models import Montura, Luna, Accesorio

class Empleado(models.Model):
    CONDICION_EMPLEADO= [
        ('Activo', 'activo'),
        ('Inactivo', 'inactivo'),
    ]
    emplCod = models.AutoField(primary_key = True)
    emplNom = models.CharField(max_length = 50)
    emplCarg = models.CharField(max_length = 20)
    empUsua = models.CharField(max_length = 40)
    empContr = models.CharField(max_length = 8)
    empCond = models.CharField(choices = CONDICION_EMPLEADO)
    
class Venta(models.Model):
    TIPO_PAGO = [
        ('Efectivo', 'efectivo'),
        ('Credito', 'credito'),
        ('Debito', 'debito'),
    ]
    ESTADO_PAGO = [
        ('Adelanto', 'adelanto'),
        ('Proceso', 'proceso'),
        ('Cancelado', 'cancelado'),
    ]
    ventNum = models.AutoField(primary_key = True)
    cliCod = models.OneToOneField(Cliente, on_delete=models.CASCADE, related_name='compras')    #Cuando se elimina cliente se eliminan sus recetas
    empCod = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='ventas')
    venFecha = models.DateTimeField(default=timezone.now)
    venTipoPago = models.CharField(choices=TIPO_PAGO)
    venEstado = models.CharField(choices = ESTADO_PAGO)
    venSaldoRes = models.FloatField(null=True)  

class DetalleVentaMontura(models.Model):
    ventNum = models.ForeignKey(Venta, on_delete=models.CASCADE)
    proCod = models.ForeignKey(Montura, on_delete=models.CASCADE)
    detVenCantidad = models.PositiveIntegerField()
    detVenValorUni = models.DecimalField(max_digits=10, decimal_places=2)
    detVenSubtotal = models.DecimalField(max_digits=10, decimal_places=2)
    detVenDescr = models.CharField(max_length=255)
    

class DetalleVentaLuna(models.Model):
    ventNum = models.ForeignKey(Venta, on_delete=models.CASCADE)
    proCod = models.ForeignKey(Luna, on_delete=models.CASCADE)
    detVenCantidad = models.PositiveIntegerField()
    detVenValorUni = models.DecimalField(max_digits=10, decimal_places=2)
    detVenSubtotal = models.DecimalField(max_digits=10, decimal_places=2)
    detVenDescr = models.CharField(max_length=255)
    

class DetalleVentaAccesorio(models.Model):
    ventNum = models.ForeignKey(Venta, on_delete=models.CASCADE)
    proCod = models.ForeignKey(Accesorio, on_delete=models.CASCADE)
    detVenCantidad = models.PositiveIntegerField()
    detVenValorUni = models.DecimalField(max_digits=10, decimal_places=2)
    detVenSubtotal = models.DecimalField(max_digits=10, decimal_places=2)
    detVenDescr = models.CharField(max_length=255)

class BoletaElectronica(models.Model):
    boletNum = models.IntegerField(primary_key=True)
    ventNum = models.OneToOneField(Venta, on_delete=models.CASCADE, related_name='boleta_de_venta')
    boletSerie = models.CharField(max_length=10)
    boletCorrelat = models.CharField(max_length=20)
    boleFech = models.DateField()
    
    TIPO_DOC_CHOICES = [
        ('B', 'Boleta'),
        ('F', 'Factura'),
    ]
    boleTipoDoc = models.CharField(max_length=1, choices=TIPO_DOC_CHOICES)
    
    ESTADO_ENVIO_CHOICES = [
        ('N', 'No enviada'),
        ('P', 'En proceso'),
        ('E', 'Enviada'),
    ]
    boleEstadoEnvio = models.CharField(max_length=1, choices=ESTADO_ENVIO_CHOICES)

    
