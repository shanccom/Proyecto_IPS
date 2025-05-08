from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccesorioViewSet, MonturaViewSet, LunaViewSet

router = DefaultRouter()
router.register(r'accesorios', AccesorioViewSet)
router.register(r'monturas', MonturaViewSet)
router.register(r'lunas', LunaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
