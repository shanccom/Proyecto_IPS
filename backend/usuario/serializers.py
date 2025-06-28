from django.forms import ValidationError
from rest_framework import serializers
from .models import Usuario
from ventas.models import Empleado
from rest_framework.authtoken.models import Token
from django.contrib.auth.password_validation import validate_password

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    emplCod = serializers.PrimaryKeyRelatedField(
        queryset=Empleado.objects.all(), 
        required=False, 
        allow_null=True
    )
    # Campos adicionales para mostrar información del empleado
    empleado_nombre = serializers.CharField(source='emplCod.emplNom', read_only=True)
    empleado_cargo = serializers.CharField(source='emplCod.emplCarg', read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'usuarioNom', 'emplCod', 'empleado_nombre', 'empleado_cargo',
            'is_active', 'is_staff', 'is_superuser', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'is_superuser': {'read_only': True},
            'emplCod': {'required': False}, 
        }

    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except ValidationError as e:
                raise serializers.ValidationError(e.messages)
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