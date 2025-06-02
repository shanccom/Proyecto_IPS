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
    
    path('recetas/', RecetaListCreateView.as_view(), name='recetas-list-create'),

]
"""
    #Denise :v pon tus url en el product url para que este ordenado
    path('productoslista/', ProductosView.as_view(), name='productos'),
    path('productoslista/filtros/montura/', obtener_filtros_montura),
    path('productoslista/filtros/accesorio/', obtener_filtros_accesorio),
    #path('productoslista/filtros/',obtener_opciones_filtros),
    path('monturas/', crear_montura),
    path('accesorios/', crear_accesorio),
"""