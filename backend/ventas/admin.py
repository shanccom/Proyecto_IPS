from django.contrib import admin
from .models import Venta, DetalleVenta

class DetalleVentaInline(admin.TabularInline):
    model = DetalleVenta
    extra = 1 

class VentaAdmin(admin.ModelAdmin):
    list_display = ['id', 'cliente', 'fecha', 'total', 'estado']
    inlines = [DetalleVentaInline]  

admin.site.register(Venta, VentaAdmin)
admin.site.register(DetalleVenta)