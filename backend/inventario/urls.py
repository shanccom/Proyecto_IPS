from django.urls import path
from .views import (
    ProductosView,
    new_product_montura,
    search
)

urlpatterns = [
    path('', ProductosView.as_view(), name="listar_productos"),
    path(r'create_montura', new_product_montura, name="crear_montura"),
    path(r'buscar', search, name="buscar_producto"),
]
