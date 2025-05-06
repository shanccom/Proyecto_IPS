from django.db import models

class ProductoBase(models.Model):
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        abstract = True

class Accesorio(ProductoBase):
    pass

class Montura(ProductoBase):
    MATERIAL_CHOICES = [
        ('metal', 'Metal'),
        ('plastico', 'Plástico'),
        ('otro', 'Otro'), ##Exiten mas materiales pero no me los conozco :(
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
        #Revisalo porfa busque y habia esos
        ('monofocal', 'Monofocal'),
        ('bifocal', 'Bifocal'),
        ('progresiva', 'Progresiva'),
    ]

    material = models.CharField(max_length=50)
    halo = models.CharField(max_length=50)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
