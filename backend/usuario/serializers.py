from rest_framework import serializers
from .models import Empleado, Usuario
from rest_framework.authtoken.models import Token
#Usuario 

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['usuarioNom', 'emplCod', 'is_active', 'is_staff', 'is_superuser']
        extra_kwargs = {'password': {'write_only': True}}  # No devolver la contraseña en la API

    def get_token(self, obj):
        """Devolver el token del usuario"""
        token, created = Token.objects.get_or_create(user=obj)
        return token.key
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario.objects.create_user(**validated_data, password=password)
        return usuario