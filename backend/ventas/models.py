from django.db import models
from decimal import Decimal

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

    def __str__(self):
        return f"{self.cliNom} - {self.cliNumDoc}"

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