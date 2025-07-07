from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'clientes', views.ClienteViewSet, basename='cliente')
router.register(r'lunas', views.LunaViewSet, basename='luna')

urlpatterns = [
    path('', include(router.urls)),
    path('boletas/', views.crear_boleta, name='crear_boleta'),
    path('boletas/lista/', views.listar_boletas, name='listar_boletas'),
    path('boletas/siguiente-correlativo/<str:serie>/', views.obtener_siguiente_correlativo, name='siguiente_correlativo'),
    path('create_empleado', views.new_empleado, name = 'nuevo empleado'),

    path('boletas/ventas/', views.ventas_total, name='ventas_total'),
    path('resumen_dashboard/', views.resumen_dashboard, name='resumen dashboard'),
    path('productos-recientes/', views.ultimos_productos_vendidos, name='productos_recientes_dashboard'),
    path('informes/productos-vendidos-dia/', views.productos_dia_detalle, name='productos_dia_detalle'),

    # RUTAS PARA SUNAT
    path('boletas/<int:boleta_id>/reenviar-sunat/', views.reenviar_boleta_sunat, name='reenviar_sunat'),
    path('boletas/<int:boleta_id>/descargar-cdr/', views.descargar_cdr, name='descargar_cdr'),

]
