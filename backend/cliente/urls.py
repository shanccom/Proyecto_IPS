from django.urls import path
from . import views

urlpatterns = [
    path('create_receta/', views.create_receta, name='crear_receta'),
    path('recetas_cliente/', views.recetas_cliente, name='recetas de cliente')
]
