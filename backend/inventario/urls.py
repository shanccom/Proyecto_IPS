from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from .views import (
    PublicacionViewSet,
    get_publicaciones_amigos
)

router = routers.DefaultRouter()
router.register(r'movie', views.MovieViewSet)
urlpatterns = [
    path(r'admin', admin.site.urls),
    path('', include(router.urls)),
    path(r'api-auth', include('router.urls', name='rest_framework'))
path(r'<direccion', <viewPetition>, name='rest_framework'))
]
