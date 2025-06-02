from rest_framework import serializers
from .models import Cliente, Receta

class RecetaSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(source='recCod')
    medicion_propia = serializers.BooleanField(source='rectOpt')
    fecha = serializers.DateField(source = 'rectFech')
    OD_SPH = serializers.DecimalField(source='recOD_sph', max_digits=4,decimal_places=2)
    OD_CYL = serializers.DecimalField(source='recOD_cyl', max_digits=4,decimal_places=2)
    OD_eje = serializers.DecimalField(source='recOD_eje', max_digits=4,decimal_places=2)
    
    OI_SPH = serializers.DecimalField(source='recOI_sph', max_digits=4,decimal_places=2)
    OI_CYL = serializers.DecimalField(source='recOI_cyl', max_digits=4,decimal_places=2)
    OI_eje = serializers.DecimalField(source='recOI_eje', max_digits=4,decimal_places=2)
    
    # Distancia Interpupilar 
    DIP_Lejos = serializers.DecimalField(source='recDIPLejos', max_digits=3, decimal_places=1, allow_null=True)
    DIP_Cerca = serializers.DecimalField(source='recDIPCerca', max_digits=3, decimal_places=1, allow_null=True)
    
    
    #Opcional si son bifocales +50 años
    #OD_adicion = serializers.DecimalField(source='recOD_adicion', max_digits=4, decimal_places=2, allow_null=True, required=False)
    #OI_adicion = serializers.DecimalField(source='recOI_adicion', max_digits=4, decimal_places=2, allow_null=True, required=False)
    adicion = serializers.DecimalField(source='rec_adicion', max_digits=4, decimal_places=2, required=False, allow_null=True)
    
    class Meta: 
        model = Receta
        fields = ['codigo', "medicion_propia", "fecha", "OD_SPH", "OD_CYL", "OD_eje", "OI_SPH", "OI_CYL", "OI_eje", "DIP_Lejos", "DIP_Cerca", "adicion",]
        read_only_fields = ['codigo']
        
    def validate(self, data):
        if data.get('OD_adicion') and data.get('OI_adicion'):
            if data.get('OD_adicion') < 0 or data.get('OI_adicion') < 0:
                raise serializers.ValidationError("Las adiciones deben ser valores positivos.")
        
        if data.get('DIP') and not (45 <= data.get('DIP') <= 75):
            raise serializers.ValidationError("El valor de DIP debe estar entre 45 y 75 mm.")
        
        return data

    def create(self, validated_data):
        # recCod se generará automáticamente en el método save() de la forma d modelo
        receta = Receta.objects.create(**validated_data)
        return receta

class ClienteSerializer(serializers.ModelSerializer):
    codigo = serializers.IntegerField(source='cliCod', read_only=True)
    nombre_completo = serializers.CharField(source='cliNombComp')
    tipo_documento = serializers.ChoiceField(source='cliTipoDoc', choices=[('DNI', 'DNI'), ('Pasaporte', 'Pasaporte')])
    numero_documento = serializers.CharField(source='cliNumDoc', allow_blank=True, required=False)
    numero_celular = serializers.CharField(source='cliNumCel', allow_blank=True, required=False)
    edad = serializers.IntegerField(source='cliEdad', required=False)
    
    recetas = RecetaSerializer(many=True, read_only=True)

    class Meta:
        model = Cliente
        fields = [
            'codigo',
            'nombre_completo',
            'tipo_documento',
            'numero_documento',
            'numero_celular',
            'edad',
            'recetas'
        ]

    def validate_numero_documento(self, value):
        tipo_doc = self.initial_data.get("tipo_documento")
        if tipo_doc == "DNI" and len(value) != 8:
            raise serializers.ValidationError("El DNI debe tener exactamente 8 dígitos.")
        elif tipo_doc == "Pasaporte" and len(value) < 5:
            raise serializers.ValidationError("El pasaporte debe tener al menos 5 caracteres.")
        return value

    def validate_edad(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("La edad no puede ser negativa.")
        return value

    def create(self, validated_data):
        return Cliente.objects.create(**validated_data)