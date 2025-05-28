from django.contrib import admin
from ventas.models import Empleado, Venta, DetalleVentaLuna, DetalleVentaMontura, DetalleVentaAccesorio, BoletaElectronica
# Register your models here.
admin.site.register(Empleado)
admin.site.register(Venta)
admin.site.register(DetalleVentaLuna)
admin.site.register(DetalleVentaMontura)
admin.site.register(DetalleVentaAccesorio)
admin.site.register(BoletaElectronica)