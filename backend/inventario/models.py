from django.db import models
import string
#Solo llevar inventario de Producto y Accesorios la luna se crea al momento de la venta para tener registro de su existencia y pedido
class Producto(models.Model):  #modelo abstracto no existente
    proCosto = models.DecimalField(max_digits=10, decimal_places=2)
    proPrecioVenta = models.DecimalField(max_digits=10, decimal_places=2)
    proDescrip = models.TextField(blank=True, null=True) 
    class Meta:
        abstract = True
        

#Subclases
class Montura(Producto):
    monCod = models.CharField(max_length=10, unique=True, blank=True, primary_key=True)

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
    #Ajuste para guardar segun el material y sea un autofield
    def save(self, *args, **kwargs):
        if not self.monCod:
            codigo_base = self.monMate
            ultimo = self.__class__.objects.filter(monCod__startswith=codigo_base).count() + 1
            self.monCod = f"{codigo_base}{ultimo}"
        super().save(*args, **kwargs)

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
    lunaCod = models.AutoField(primary_key=True)
    lunaProp = models.CharField(max_length=50, choices=LUNA_CHOICES)
    lunaMat = models.CharField(max_length=20, choices=MATERIALLUNA_CHOICES)
    lunaColorHalo = models.CharField(max_length=20, choices=HALO_CHOICES)

class Accesorio(Producto):
    accNombre = models.CharField(max_length=100)
    accCod = models.AutoField(primary_key=True)
    