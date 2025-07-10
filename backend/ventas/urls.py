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
    path('boletas/<int:boleta_id>/eliminar/', views.eliminar_boleta, name='eliminar_boleta'),


    path('boletas/ventas/', views.ventas_total, name='ventas_total'),
    path('boletas/compras-total/', views.compras_total, name='compras-total'),
    path('resumen_dashboard/', views.resumen_dashboard, name='resumen dashboard'),
    path('productos-recientes/', views.ultimos_productos_vendidos, name='productos_recientes_dashboard'),
    path('boletas/pendientes/', views.boletas_pendientes, name ='boletas pendientes'),
    path('boletas/top-clientes/', views.top_clientes_frecuentes, name='top_clientes'),
    path('boletas/resumen_reportes/', views.resumen_reportes, name='resumen_reportes'),
    path('boletas/productos-vendidos/', views.productos_vendidos, name='productos_vendidos'),


    # NUEVAS RUTAS PARA SUNAT
    path('boletas/<int:boleta_id>/reenviar-sunat/', views.reenviar_boleta_sunat, name='reenviar_sunat'),
    path('boletas/<int:boleta_id>/descargar-cdr/', views.descargar_cdr, name='descargar_cdr'),

    # Nuevos endpoints para pagos parciales
    path('boletas/<int:boleta_id>/adelantos/', views.registrar_adelanto, name='registrar_adelanto'),
    path('boletas/<int:boleta_id>/obtener_adelantos/', views.obtener_adelantos_boleta, name='obtener_adelantos'),
    path('boletas/<int:boleta_id>/estado-pago/', views.obtener_estado_pago, name='estado_pago'),
    path('boletas/<int:boleta_id>/procesar-pago/', views.procesar_pago_con_verificacion, name='procesar_pago'),
    path('boletas/<int:boleta_id>/adelantos/<int:adelanto_id>/', views.eliminar_adelanto, name='eliminar_adelanto'),
    path('resumen-pagos/', views.obtener_resumen_pagos, name='resumen_pagos'),
    
    # Empleados
    path('create_empleado/', views.new_empleado, name = 'nuevo_empleado'),
    path('delete_empleado/', views.delete_empleado, name = 'borrar_empleado'),
    path('list_empleados/', views.list_empleado, name = 'Lista_empleados'),
    path('empleado_info/', views.empleado_info, name = 'informacion_empleado'),
    path('update_empleado/', views.update_empleado, name = 'editar_empleado'),
]