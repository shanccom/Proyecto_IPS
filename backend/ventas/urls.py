from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'clientes', views.ClienteViewSet, basename='cliente')
router.register(r'lunas', views.LunaViewSet, basename='luna')

# URLs de la app venta
urlpatterns = [
    # Incluir todas las rutas del router
    path('', include(router.urls)),
]