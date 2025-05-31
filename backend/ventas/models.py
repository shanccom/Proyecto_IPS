from django.db import models
from cliente.models import Cliente
from django.utils import timezone
from inventario.models import Montura, Luna, Accesorio
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from rest_framework.authtoken.models import Token

class Empleado(models.Model):
    CONDICION_EMPLEADO= [
        ('Activo', 'activo'),
        ('Inactivo', 'inactivo'),
    ]
    CARGO= [
        ('Gerente', 'gerente'),
        ('Colaborador', 'colaborador'),
    ]
    emplCod = models.AutoField(primary_key = True)
    emplNom = models.CharField(max_length = 50)
    emplCarg = models.CharField(max_length = 20, choices=CARGO)
    empCond = models.CharField(choices = CONDICION_EMPLEADO, max_length=20)
    
    def __str__(self):
        return f"{self.emplCod} {self.emplNom} {self.emplCarg}"

class CustomUserManager(BaseUserManager):
    def create_user(self, usuarioNom, password, emplCod):
        if not usuarioNom:
            raise ValueError("El usuario debe tener un nombre")
        
        user = self.model(usuarioNom=usuarioNom, emplCod=emplCod)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, usuarioNom, password, emplCod):
        user = self.create_user(usuarioNom, password, emplCod)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser):
    usuarioNom = models.CharField(unique= True, max_length = 10)
    emplCod = models.OneToOneField(Empleado, related_name='Dueño', on_delete=models.CASCADE)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    objects = CustomUserManager()
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = "usuarioNom"
    REQUIRED_FIELDS = ["emplCod"]

    def __str__(self):
        return str( self.usuarioNom)
    
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
    cliCod = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='compras')    #Cuando se elimina cliente se eliminan sus recetas
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

    
