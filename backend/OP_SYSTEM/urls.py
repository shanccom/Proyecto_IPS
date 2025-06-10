from django.contrib import admin
from django.urls import path
from django.urls import path, include
from inventario.views import ProductosView #url 
from inventario.views import ProductosView #url products
from inventario.views import obtener_filtros_accesorio, obtener_filtros_montura
from inventario.views import crear_montura, crear_accesorio 
from cliente.views import RecetaListCreateView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('productos/', include('inventario.urls')),
    path('ventas/', include('ventas.urls')),
    path('usuario/', include('usuario.urls')),
    path('cliente/', include('cliente.urls')),

]
