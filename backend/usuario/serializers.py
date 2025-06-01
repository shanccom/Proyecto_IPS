from rest_framework import serializers
from .models import Empleado, Venta, BoletaElectronica, Usuario
#Usuario 
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['NombreUser', 'empleado', 'apellidos']
        
    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)
    
