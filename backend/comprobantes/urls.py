from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComprobanteViewSet

router = DefaultRouter()
router.register(r'comprobantes', ComprobanteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]