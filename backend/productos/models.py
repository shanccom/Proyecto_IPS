from django.db import models

class ProductoBase(models.Model):
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField(default='Sin descripción')

    class Meta:
        abstract = True

class Accesorio(ProductoBase):
    pass

class Montura(ProductoBase):
    MATERIAL_CHOICES = [
        ('acetato', 'Acetato'),
        ('acero de moneda', 'Acero de Moneda'),
        ('carey', 'Carey'),
        ('metal', 'Metal'),
        ('plastico', 'Plástico'),
        ('tr', 'TR'),
        ('otro', 'Otro'),
    ]
    PUBLICO_CHOICES = [
        ('hombre', 'Hombre'),
        ('mujer', 'Mujer'),
        ('niño', 'Niño'),
    ]

    marca = models.CharField(max_length=50)
    material = models.CharField(max_length=20, choices=MATERIAL_CHOICES)
    publico_dirigido = models.CharField(max_length=10, choices=PUBLICO_CHOICES)

class Luna(ProductoBase):
    TIPO_CHOICES = [
        ('monocromatico blue', 'Monocromatico Blue'),
        ('ar', 'AR'),
        ('fotocromatico', 'Fotocromatico'),
    ]

    MATERIAL_CHOICES = [
        ('policarbonato', 'Policarbonato'),
        ('nk', 'NK'),
        ('resina', 'Resina'),
    ]

    HALO_CHOICES = [
        ('azul', 'Azul'),
        ('verde', 'Verde'),
    ]

    material = models.CharField(max_length=20, choices=MATERIAL_CHOICES)
    halo = models.CharField(max_length=20, choices= HALO_CHOICES)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
