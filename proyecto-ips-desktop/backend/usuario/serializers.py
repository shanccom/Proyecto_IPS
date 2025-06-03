from rest_framework import serializers
from .models import Usuario
from rest_framework.authtoken.models import Token
from django.contrib.auth.password_validation import validate_password

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Usuario
        fields = ['id', 'usuarioNom', 'emplCod', 'is_active', 'is_staff', 'is_superuser', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'is_superuser': {'read_only': True},  # Solo superusers pueden modificar esto
        }

    def validate_password(self, value):
        """Validar contraseña usando validadores de Django"""
        if value:
            validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError("La contraseña es requerida")
        
        usuario = Usuario.objects.create_user(
            usuarioNom=validated_data['usuarioNom'],
            password=password,
            emplCod=validated_data.get('emplCod'),
            is_active=validated_data.get('is_active', True)
        )
        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Actualizar campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Actualizar contraseña si se proporciona
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance
