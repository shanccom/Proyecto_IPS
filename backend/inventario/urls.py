from django.urls import path
from .views import (
    ProductosView,
    new_product_montura,
    search,
    crear_montura,
    crear_accesorio,
    obtener_filtros_accesorio,
    obtener_filtros_montura,
)

urlpatterns = [
    path('', ProductosView.as_view(), name="listar_productos"),
    path(r'create_montura',crear_montura),
    path(r'create_accesorio',crear_accesorio),
    path(r'buscar', search, name="buscar_producto"),
    path(r'filter_montura', obtener_filtros_montura, name="filtros de montura"),
    path(r'filter_accesorio', obtener_filtros_accesorio, name="filtros de accesorio"),
]
