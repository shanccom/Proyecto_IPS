"""
URL configuration for OP_SYSTEM project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.urls import path, include
from inventario.views import ProductosView #url 
from usuario.views import login  #Para poner login como pagina principal para pruebas tokens
from inventario.views import obtener_opciones_filtros
from inventario.views import ProductosView #url products
from inventario.views import obtener_filtros_accesorio, obtener_filtros_montura
from inventario.views import crear_montura, crear_luna, crear_accesorio 


urlpatterns = [
    path('', login),
    path('admin/', admin.site.urls),
    path('productos/', include('inventario.urls')),
    path('usuario/', include('usuario.urls')),
    path('productoslista/', ProductosView.as_view(), name='productos'),
    path('productoslista/filtros/montura/', obtener_filtros_montura),
    path('productoslista/filtros/accesorio/', obtener_filtros_accesorio),
    #path('productoslista/filtros/',obtener_opciones_filtros),
    path('monturas/', crear_montura),
    path('lunas/', crear_luna),
    path('accesorios/', crear_accesorio),
]
