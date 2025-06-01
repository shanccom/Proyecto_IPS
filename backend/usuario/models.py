from django.db import models
from ventas.models import Empleado
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from rest_framework.authtoken.models import Token
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.dispatch import receiver
from django.db.models.signals import post_save
# Falta asignar que el primer usuario creado sea superusuario y sea el gerente
# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, usuarioNom, password, emplCod):
        if not usuarioNom:
            raise ValueError("El usuario debe tener un nombre")
        # Verificar si es el primer usuario para hacerlo superusuario
        is_first_user = not Usuario.objects.exists()
        if is_first_user:
            emplCod = self._get_or_create_default_admin() #Quiero que se cree uno de gerencia
        user = self.model(usuarioNom=usuarioNom, emplCod=emplCod)
        user.set_password(password)
        if is_first_user:
            user.is_staff = True
            user.is_superuser = True
        user.save(using=self._db)
        return user
        
    def create_superuser(self, usuarioNom, password, emplCod):
        user = self.create_user(usuarioNom, password, emplCod)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
    def _get_or_create_default_admin(self):
        try:
            # Buscar si ya existe un empleado gerente por defecto
            empleado_gerente = Empleado.objects.filter(
                models.Q(emplNom__icontains='gerente') | 
                models.Q(emplNom__icontains='admin') |
                models.Q(emplCargo__icontains='gerente')
            ).first()
            
            if not empleado_gerente:
                # Crear empleado gerente por defecto
                empleado_gerente = Empleado.objects.create(
                    emplNom='Gerente',
                    emplApellido='Sistema',
                    emplCargo='Gerente General',
                    emplEmail='gerente@sistema.com',
                    emplTelefono='999999999',
                    # Agrega otros campos requeridos según tu modelo Empleado
                )
                print(f" Empleado Gerente por defecto creado: {empleado_gerente}")
            
            return empleado_gerente
            
        except Exception as e:
            print(f"Error creando empleado por defecto: {e}")
            # Si falla, intentar obtener cualquier empleado existente
            return Empleado.objects.first()
    
    def create_superuser(self, usuarioNom, password, emplCod=None):
        if not emplCod:
            emplCod = self._get_or_create_default_employee()
            
        user = self.create_user(usuarioNom, password, emplCod)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser):
    usuarioNom = models.CharField(unique= True, max_length = 10)
    emplCod = models.OneToOneField(Empleado, related_name='usuario', on_delete=models.CASCADE)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    objects = CustomUserManager()
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = "usuarioNom"
    REQUIRED_FIELDS = ["emplCod"]

    def __str__(self):
        return str( self.usuarioNom)
# Señal para crear token automáticamente
@receiver(post_save, sender=Usuario)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)