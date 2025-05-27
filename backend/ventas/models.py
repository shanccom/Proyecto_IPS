from django.db import models
from cliente.models import Cliente
from django.utils import timezone

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
    
