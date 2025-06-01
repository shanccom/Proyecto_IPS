from django.db import models

class Producto(models.Model):  #modelo abstracto
    proCod = models.AutoField(primary_key=True)
    proNombre = models.CharField(max_length=100)
    proTipo = models.CharField(max_length=50) #Montura/luna/accesorio
    proCosto= models.DecimalField(max_digits=10, decimal_places=2)
    proPrecioVenta = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        abstract = True

#Subclases
class Montura(Producto):
    MATERIAL_CHOICES = [
        ('M', 'Metal'),
        ('P', 'Plástico'),
        ('A', 'Acetato'),
        ('C', 'Carey'),
        ('TR', 'TR'),
    ]
    PUBLICO_CHOICES = [
        ('mujer_clasico', 'Mujer Clasico'),
        ('mujer_tendencia', 'Mujer Tendencia'),
        ('niño', 'Niño'),
        ('Varon_clasico', 'Varon Clasico'),
        ('varon_tendencia', 'Varon Tendencia'),
    ]
    MARCAS_CHOICES = [
        ('zetti', 'Zetti'),
        ('fiorella_conte', 'Fiorella Conte'),
        ('ferioni', 'Ferioni'),
    ]
    COLOR_CHOICES = [
        ('rojo', 'Rojo'),
        ('negro', 'Negro'),
        ('animal-print', 'Animal-Print'),
        ('blanco', 'Blanco'),
        ('rosa', 'Rosa'),
        ('nude', 'Nude'),
        ('verde', 'Verde'),
        ('azul', 'Azul'),
        ('dorado', 'Dorado'),
        ('plateado', 'Plateado'),
        ('transparente', 'Transparente'),
        ('plomo', 'Plomo'),
    ]

    monMarca = models.CharField(max_length=50, choices=MARCAS_CHOICES)
    monPubl = models.CharField(max_length=25, choices=PUBLICO_CHOICES)
    monMate = models.CharField(max_length=25, choices=MATERIAL_CHOICES)
    monColor = models.CharField(max_length=25, choices=COLOR_CHOICES, default='negro')
    monVendida = models.BooleanField(default=False) #Producto vendido?

class Accesorio(Producto):
    accDescrip = models.TextField(blank=True, null=True)