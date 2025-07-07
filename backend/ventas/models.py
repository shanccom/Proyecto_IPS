from django.db import models
from cliente.models import Cliente
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from rest_framework.authtoken.models import Token
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from decimal import Decimal

class Empleado(models.Model):
    CONDICION_EMPLEADO= [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]
    CARGO= [
        ('gerente', 'Gerente'),
        ('colaborador', 'Colaborador'),
    ]
    emplCod = models.AutoField(primary_key = True)
    emplNom = models.CharField(max_length = 50)
    emplCarg = models.CharField(max_length = 20, choices=CARGO)
    empCond = models.CharField(choices = CONDICION_EMPLEADO, max_length=20)
    
    def __str__(self):
        return f"{self.emplCod} {self.emplNom} {self.emplCarg}"

class Cliente(models.Model):
    id = models.AutoField(primary_key=True)
    cliNumDoc = models.CharField(max_length=20, unique=True, verbose_name="Número de Documento")
    cliNom = models.CharField(max_length=100, verbose_name="Nombre")
    cliNumCel = models.CharField(max_length=15, verbose_name="Teléfono", null=True, blank=True)
    cliEmail = models.EmailField(verbose_name="Email", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        db_table = 'venta_cliente'

class Luna(models.Model):
    LUNA_CHOICES = [
        ('blue', 'Blue'),
        ('fotocromatico', 'Fotocromatico'),
        ('blue_fotocromatico', 'Blue Fotocromatico'),
        ('ar', 'AR'),
    ]
    HALO_CHOICES = [
        ('azul', 'Azul'),
        ('verde', 'Verde'),
        ('morado', 'Morado'),
    ]
    MATERIALLUNA_CHOICES= [
        ('policarbonato', 'Policarbonato'),
        ('nk', 'NK'),
        ('resina', 'Resina'),
        ('cristal', 'cristal'),
    ]
    lunaCod = models.AutoField(primary_key=True)
    lunaProp = models.CharField(max_length=50, choices=LUNA_CHOICES)
    lunaMat = models.CharField(max_length=20, choices=MATERIALLUNA_CHOICES)
    lunaColorHalo = models.CharField(max_length=20, choices=HALO_CHOICES)
    lunaCosto = models.DecimalField(max_digits= 10,decimal_places= 2)
    lunaPrecioVenta = models.DecimalField(max_digits= 10,decimal_places= 2)

class Boleta(models.Model):
    serie = models.CharField(max_length=4)
    correlativo = models.CharField(max_length=10)
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    igv = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default='pendiente')

    #NUEVOS CAMPOS PARA SUNAT
    enviado_sunat = models.BooleanField(default=False)
    hash_sunat = models.CharField(max_length=255, blank=True, null=True)
    mensaje_sunat = models.TextField(blank=True, null=True)
    codigo_sunat = models.CharField(max_length=10, blank=True, null=True)
    nombre_cdr = models.CharField(max_length=255, blank=True, null=True)
    fecha_envio_sunat = models.DateTimeField(blank=True, null=True)

    @property
    def monto_adelantos(self):
        return self.adelantos.aggregate(
            total=models.Sum('monto')
        )['total'] or Decimal('0.00')
    
    @property
    def saldo_pendiente(self):
        return self.total - self.monto_adelantos
    
    @property
    def esta_pagada_completa(self):
        return self.saldo_pendiente <= Decimal('0.00')
    
    def actualizar_estado_pago(self):
        if self.estado == 'anulada':
            return
            
        if self.esta_pagada_completa:
            if self.estado != 'enviada':
                self.estado = 'pagada'
        elif self.monto_adelantos > 0:
            self.estado = 'parcial'
        else:
            self.estado = 'pendiente'
        
        self.save()

from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

class ItemBoleta(models.Model):
    boleta = models.ForeignKey(Boleta, related_name='items', on_delete=models.CASCADE)
    
    # Hacer content_type opcional para productos personalizados
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=100, null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Campo para productos personalizados
    descripcion_personalizada = models.CharField(max_length=255, null=True, blank=True)
    
    cantidad = models.PositiveIntegerField()
    valor_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'ventas_itemboleta'
    
    def __str__(self):
        if self.descripcion_personalizada:
            return f"{self.descripcion_personalizada} (Personalizado)"
        elif self.content_object:
            return str(self.content_object)
        else:
            return f"Item {self.id}"
    
    @property
    def descripcion(self):
        """Devuelve la descripción del item, ya sea personalizada o del producto"""
        if self.descripcion_personalizada:
            return self.descripcion_personalizada
        elif self.content_object:
            # Asumiendo que tus modelos de producto tienen un campo 'nombre'
            return getattr(self.content_object, 'nombre', str(self.content_object))
        else:
            return "Producto sin descripción"
    
    @property
    def subtotal(self):
        """Calcula el subtotal del item"""
        return self.cantidad * self.valor_unitario
    
class PagoAdelanto(models.Model):
    METODO_PAGO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta'),
        ('transferencia', 'Transferencia'),
        ('deposito', 'Depósito'),
        ('cheque', 'Cheque'),
    ]
    
    boleta = models.ForeignKey(Boleta, on_delete=models.CASCADE, related_name='adelantos')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateTimeField(default=timezone.now)
    descripcion = models.CharField(max_length=255, blank=True)
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES, default='efectivo')
    
    def __str__(self):
        return f"Adelanto {self.id} - {self.boleta.serie}-{self.boleta.correlativo}"
    
    class Meta:
        ordering = ['-fecha_pago']