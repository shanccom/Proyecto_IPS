from django.db import models

import string
#Solo llevar inventario de Producto y Accesorios la luna se crea al momento de la venta para tener registro de su existencia y pedido
class Producto(models.Model):  #modelo abstracto no existente
    proCosto = models.DecimalField(max_digits=10, decimal_places=2)
    proPrecioVenta = models.DecimalField(max_digits=10, decimal_places=2)
    proDescrip = models.TextField(blank=True, null=True) 
    proStock = models.IntegerField(default=100)
    class Meta:
        abstract = True

#Subclases
class Montura(Producto):
    monCod = models.CharField(primary_key=True, max_length=20, unique=True)
    MATERIAL_CHOICES = [
        ('Metal', 'Metal'),
        ('Plastico', 'Plástico'),
        ('Acetato', 'A'),
        ('Carey', 'Carey'),
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
        self.proStock = 1
        
        if not self.monCod:
            codigo_base = self.monMate[0]
            ultimo = self.__class__.objects.filter(monCod__startswith=codigo_base).count() + 1
            
            # Calcular cuántos dígitos necesitamos para alcanzar 15 caracteres
            digitos_necesarios = 10 - len(codigo_base)
            
            # Rellenar con ceros a la izquierda para alcanzar la longitud requerida
            numero_formateado = str(ultimo).zfill(digitos_necesarios)
            
            self.monCod = f"{codigo_base}{numero_formateado}"
        
        super().save(*args, **kwargs)

class Accesorio(Producto):
    accCod = models.AutoField(primary_key=True)
    accNombre = models.CharField(max_length=100)
