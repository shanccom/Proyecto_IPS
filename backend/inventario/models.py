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
        ('metal', 'Metal'),
        ('plastico', 'Plástico'),
        ('acetato', 'Acetato'),
        ('carey', 'Carey'),
        ('tr', 'TR'),
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
    monMarca = models.CharField(max_length=50, choices=MARCAS_CHOICES)
    monPubl = models.CharField(max_length=25, choices=PUBLICO_CHOICES)
    monMate = models.CharField(max_length=25, choices=MATERIAL_CHOICES)

class Luna(Producto):
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
    lunaProp = models.CharField(max_length=50, choices=LUNA_CHOICES)
    lunaMat = models.CharField(max_length=20, choices=MATERIALLUNA_CHOICES)
    lunaColorHalo = models.CharField(max_length=20, choices=HALO_CHOICES)

class Accesorio(Producto):
    accDescrip = models.TextField(blank=True, null=True)