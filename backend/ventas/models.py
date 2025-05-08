from django.db import models
from productos.models import Accesorio, Montura, Luna
from clientes.models import Cliente

class Venta(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estado = models.CharField(max_length=20, choices=[('pendiente', 'Pendiente'), ('enviado', 'Enviado'), ('anulado', 'Anulado')])

    def calcular_total(self):
        total_venta = sum([detalle.total for detalle in self.detalles.all()])
        self.total = total_venta
        self.save()

    def __str__(self):
        return f"Venta {self.id} - {self.cliente.rzn_social}"


class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, related_name="detalles", on_delete=models.CASCADE)
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