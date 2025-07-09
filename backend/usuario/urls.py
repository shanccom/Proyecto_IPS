from django.urls import path
from .views import (
    register, #Login se encuentra en pagina principal importado directamente en el principal
    logout,
    login,
    change_password,
    list_users,
    update_user_status,
    verify_token,
    perfil,
    delete_user
    
)

urlpatterns = [
    path('register/', register, name = 'register_user'),
    path('login/', login, name = 'login'),
    path('logout/', logout, name='logout'),
    
    path('change-password/', change_password, name='change_password'),
    path('verify-token/', verify_token, name='verify_token'),
    
    # Administración (solo staff)
    path('admin/users/', list_users, name='list_users'),
    path('admin/users/<int:user_id>/status/', update_user_status, name='update_user_status'),
    path('perfil/', perfil, name='perfil_user'),
    path('admin/users/<int:user_id>', delete_user, name='delete_user')
]
