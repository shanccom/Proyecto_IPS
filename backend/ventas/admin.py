from django.contrib import admin
from ventas.models import Empleado, Venta, DetalleVenta, BoletaElectronica, Luna
# Register your models here.
admin.site.register(Empleado)
admin.site.register(Venta)
admin.site.register(DetalleVenta)
admin.site.register(BoletaElectronica)
admin.site.register(Luna)