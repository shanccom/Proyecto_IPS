from django.urls import path
from .views import (
    register, #Login se encuentra en pagina principal importado directamente en el principal
    logout,
    login,
    change_password,
    list_users,
    update_user_status,
    verify_token
)

urlpatterns = [
    path(r'register', register, name = 'register_user'),
    path(r'login', login, name = 'login'),
    path(r'logout', logout, name='logout'),
    
    path(r'change-password', change_password, name='change_password'),
    path(r'verify-token', verify_token, name='verify_token'),
    
    # Administración (solo staff)
    path(r'admin/users', list_users, name='list_users'),
    path(r'admin/users/<int:user_id>/status/', update_user_status, name='update_user_status'),
]
