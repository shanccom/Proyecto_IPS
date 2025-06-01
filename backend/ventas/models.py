from django.db import models
from cliente.models import Cliente
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

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
    

class Venta(models.Model):
    TIPO_PAGO = [
        ('efectivo', 'Efectivo'),
        ('credito', 'Credito'),
        ('debito', 'Debito'),
    ]
    ESTADO_PAGO = [
        ('adelanto', 'Adelanto'),
        ('proceso', 'Proceso'),
        ('cancelado', 'Cancelado'),
    ]
    ventNum = models.AutoField(primary_key = True)
    cliCod = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='compras')    #Cuando se elimina cliente se eliminan sus recetas
    empCod = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='ventas')
    venFecha = models.DateTimeField(default=timezone.now)
    venTipoPago = models.CharField(choices=TIPO_PAGO)
    venEstado = models.CharField(choices = ESTADO_PAGO)
    venSaldoRes = models.FloatField(null=True)  

class DetalleVenta(models.Model):
    ventNum = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')

    # Campos para GenericForeignKey:
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    producto = GenericForeignKey('content_type', 'object_id')

    detVenCantidad = models.PositiveIntegerField()
    detVenValorUni = models.DecimalField(max_digits=10, decimal_places=2)
    detVenSubtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    detVenDescr = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        # Calcula subtotal si no se proporciona
        if not self.detVenSubtotal:
            self.detVenSubtotal = self.detVenCantidad * self.detVenValorUni
        super().save(*args, **kwargs)

    def clean(self):
        from django.core.exceptions import ValidationError
        modelo = self.content_type.model_class().__name__  # e.g. "Montura", "Luna", "Accesorio"
        permiso = ['Montura', 'Luna', 'Accesorio']
        if modelo not in permiso:
            raise ValidationError(f"DetalleVenta sólo puede apuntar a {permiso}, no a '{modelo}'.")
        if self.detVenCantidad <= 0:
            raise ValidationError("La cantidad debe ser mayor a 0.")
        if self.detVenValorUni <= 0:
            raise ValidationError("El valor unitario debe ser mayor a 0.")
        super().clean()

    def __str__(self):
        return f"Boleta {self.boletSerie}-{self.boletCorrelat} para Venta {self.ventNum.ventNum}"
     
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
    def clean(self):
        from django.core.exceptions import ValidationError

        if self.ventNum.venEstado != 'cancelado':
            raise ValidationError("La boleta solo puede generarse si la venta está cancelada totalmente")
        super().clean()

    def __str__(self):
        return f"Boleta {self.boletSerie}-{self.boletCorrelat} para Venta {self.ventNum.ventNum}"