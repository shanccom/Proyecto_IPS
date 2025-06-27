from django.urls import path
from . import views

urlpatterns = [
    path('create_receta/', views.create_receta, name='crear_receta'),
    path('recetas_cliente/', views.recetas_cliente, name='recetas de cliente'),
    path('obtener_clientes/', views.obtener_clientes, name='obtener clientes'),
    path('crear_cliente/', views.crear_cliente, name='crear_cliente'),
    path('update_receta/<str:codigo>/', views.update_receta, name='update_receta'),
]
