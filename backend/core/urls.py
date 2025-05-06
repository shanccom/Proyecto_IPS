from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('apiC/', include('clientes.urls')),
    path('apiP/', include('productos.urls')),
    path('apiV/', include('ventas.urls')),

]
