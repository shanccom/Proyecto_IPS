from django.db import models
from ventas.models import Venta
from productos.models import Accesorio, Montura, Luna
from django.db.models import Max

class Comprobante(models.Model):
    TIPO_COMPROBANTE = [
        ('01', 'Factura'),
        ('03', 'Boleta'),
    ]
    
    ESTADO_SUNAT = [
        ('pendiente', 'Pendiente'),
        ('enviado', 'Enviado'),
        ('observado', 'Observado'),
        ('rechazado', 'Rechazado'),
    ]

    venta = models.ForeignKey(Venta, on_delete=models.CASCADE)
    tipo_comprobante = models.CharField(max_length=2, choices=TIPO_COMPROBANTE)
    serie = models.CharField(max_length=4, blank=True)
    correlativo = models.CharField(max_length=6, blank=True)
    estado_sunat = models.CharField(max_length=10, choices=ESTADO_SUNAT, default='pendiente')
    pdf = models.FileField(upload_to='comprobantes/pdf/', null=True, blank=True)
    fecha_emision = models.DateTimeField(auto_now_add=True)



    def save(self, *args, **kwargs):
        creating = self.pk is None  # solo si es nuevo

        if creating:
            if not self.serie:
                self.serie = 'F001' if self.tipo_comprobante == '01' else 'B001'

            if not self.correlativo:
                ultimo = Comprobante.objects.filter(serie=self.serie).aggregate(mayor=Max('correlativo'))
                max_correlativo = int(ultimo['mayor'] or 0)
                self.correlativo = str(max_correlativo + 1).zfill(6)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_tipo_comprobante_display()} {self.serie}-{self.correlativo}"

class DetalleComprobante(models.Model):
    comprobante = models.ForeignKey(Comprobante, related_name='detalles', on_delete=models.CASCADE)
    tipo_producto = models.CharField(max_length=10, choices=[('accesorio', 'Accesorio'), ('montura', 'Montura'), ('luna', 'Luna')])
    producto_accesorio = models.ForeignKey(Accesorio, null=True, blank=True, on_delete=models.SET_NULL)
    producto_montura = models.ForeignKey(Montura, null=True, blank=True, on_delete=models.SET_NULL)
    producto_luna = models.ForeignKey(Luna, null=True, blank=True, on_delete=models.SET_NULL)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.tipo_producto} - {self.cantidad} x {self.precio_unitario}"

