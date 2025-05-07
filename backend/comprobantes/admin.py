from django.contrib import admin
from .models import Comprobante, DetalleComprobante

class DetalleComprobanteInline(admin.TabularInline):
    model = DetalleComprobante
    extra = 1  # cuántos formularios vacíos aparecen por defecto
    exclude = []  # puedes excluir campos si quieres

class ComprobanteAdmin(admin.ModelAdmin):
    inlines = [DetalleComprobanteInline]

admin.site.register(Comprobante, ComprobanteAdmin)
