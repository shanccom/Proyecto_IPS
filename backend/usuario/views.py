# usuario/views.py
from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError
from rest_framework import status

from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view, authentication_classes, permission_classes

# Validacion de contraseña
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.forms.models import model_to_dict

from usuario.models import Usuario
from usuario.serializers import UsuarioSerializer
import logging

logger = logging.getLogger(__name__)

# PERFIL - VERSIÓN CORREGIDA
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def perfil(request):
    try:
        # Obtener el usuario autenticado 
        user = request.user
        
        # Serializar el usuario actual
        serializer = UsuarioSerializer(user)
        
        return Response({
            'message': 'Perfil obtenido exitosamente',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error durante la recuperación de datos: {str(e)}")
        return Response({
            "error": "Ocurrió un error en el servidor.", 
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# REGISTER
@api_view(['POST'])
def register(request):
    try:
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Crear token manualmente para evitar problemas
            try:
                token = Token.objects.create(user=user)
            except Exception as token_error:
                logger.error(f"Error creando token: {token_error}")
                # Si falla el token, al menos el usuario se creó
                token = None
            
            user_data = {
                'id': user.id,
                'usuarioNom': user.usuarioNom,
                'emplCod': user.emplCod.emplCod if user.emplCod else None,  # CAMBIO: usar .emplCod en lugar del objeto
                'empleado_nombre': user.emplCod.emplNom if user.emplCod else None,
                'empleado_cargo': user.emplCod.emplCarg if user.emplCod else None,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
            
            return Response({
                "message": "Usuario registrado exitosamente",
                "token": token.key if token else None,
                "user": user_data,
            }, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Error de validación en registro: {serializer.errors}")
            return Response({
                "error": "Datos de registro inválidos", 
                "details": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Error durante el registro: {str(e)}")
        return Response({
            "error": "Ocurrió un error en el servidor.", 
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# LOGIN pagina principal
@api_view(['POST'])
def login(request):
    try:
        usuarioNom = request.data.get('usuarioNom')
        password = request.data.get('password')
        
        if not usuarioNom or not password:
            return Response({
                'error': 'Se requieren usuarioNom y password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Autenticar usuario
        user = authenticate(username=usuarioNom, password=password)
        if user is not None:
            if user.is_active:
                token, created = Token.objects.get_or_create(user=user)
                
                user_data = {
                    'id': user.id,
                    'usuarioNom': user.usuarioNom,
                    'emplCod': user.emplCod.emplCod if user.emplCod else None,  # CAMBIO: usar .emplCod en lugar del objeto
                    'empleado_nombre': user.emplCod.emplNom if user.emplCod else None,
                    'empleado_cargo': user.emplCod.emplCarg if user.emplCod else None,
                    'is_active': user.is_active,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser
                }
                
                logger.info(f"Login exitoso para usuario: {usuarioNom}")
                return Response({
                    'message': 'Login exitoso',
                    'token': token.key,
                    'user': user_data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Cuenta desactivada'
                }, status=status.HTTP_401_UNAUTHORIZED)
        else:
            logger.warning(f"Intento de login fallido para usuario: {usuarioNom}")
            return Response({
                'error': 'Credenciales inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        logger.error(f"Error durante el login: {str(e)}")
        return Response({
            "error": "Ocurrió un error en el servidor.", 
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# LOGOUT 
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        request.user.auth_token.delete()
        logger.info(f"Logout exitoso para usuario: {request.user.usuarioNom}")
        return Response({
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error durante el logout: {str(e)}")
        return Response({
            "error": "Error al hacer logout", 
            "details": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

# CHANGE PASSWORD - Cambiar contraseña
@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):
    try:
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({
                'error': 'Se requieren old_password y new_password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar contraseña actual
        if not request.user.check_password(old_password):
            return Response({
                'error': 'Contraseña actual incorrecta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar nueva contraseña
        try:
            validate_password(new_password, request.user)
        except ValidationError as e:
            return Response({
                'error': 'Nueva contraseña no válida',
                'details': list(e.messages)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cambiar contraseña
        request.user.set_password(new_password)
        request.user.save()
        request.user.auth_token.delete()
        new_token = Token.objects.create(user=request.user)
        
        logger.info(f"Contraseña cambiada para usuario: {request.user.usuarioNom}")
        return Response({
            'message': 'Contraseña cambiada exitosamente',
            'new_token': new_token.key
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al cambiar contraseña: {str(e)}")
        return Response({
            "error": "Error al cambiar contraseña", 
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#---------------Administracion de usuarios
#Usuarios creados
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@permission_classes([IsAdminUser])  # Solo staff
def list_users(request):
    try:
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        
        return Response({
            'users': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al listar usuarios: {str(e)}")
        return Response({
            "error": "Error al obtener usuarios", 
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
#Modificar actividad de empleados - Solo para staff
@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
@permission_classes([IsAdminUser])  # Solo staff
def update_user_status(request, user_id):
    try:
        usuario = Usuario.objects.get(id=user_id)
        
        # No permitir que se desactive a sí mismo
        if usuario == request.user:
            return Response({
                'error': 'No puedes modificar tu propio estado'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Actualizar campos permitidos
        if 'is_active' in request.data:
            usuario.is_active = request.data['is_active']
        
        # Solo superusers pueden modificar is_staff e is_superuser
        if request.user.is_superuser:
            if 'is_staff' in request.data:
                usuario.is_staff = request.data['is_staff']
            if 'is_superuser' in request.data:
                usuario.is_superuser = request.data['is_superuser']
        
        usuario.save()
        
        # Si se desactiva, eliminar su token
        if not usuario.is_active:
            Token.objects.filter(user=usuario).delete()
        
        serializer = UsuarioSerializer(usuario)
        return Response({
            'message': 'Usuario actualizado exitosamente',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Usuario.DoesNotExist:
        return Response({
            'error': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error al actualizar usuario: {str(e)}")
        return Response({
            "error": "Error al actualizar usuario", 
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# VERIFY TOKEN 
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def verify_token(request):
    try:
        return Response({
            'valid': True,
            'user': {
                'id': request.user.id,
                'usuarioNom': request.user.usuarioNom,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser,
                'is_active': request.user.is_active
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'valid': False,
            'error': str(e)
        }, status=status.HTTP_401_UNAUTHORIZED)