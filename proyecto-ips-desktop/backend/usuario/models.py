from django.db import models
from ventas.models import Empleado
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from rest_framework.authtoken.models import Token
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.dispatch import receiver
from django.db.models.signals import post_save
import logging

logger = logging.getLogger(__name__)

# Falta asignar que el primer usuario creado sea superusuario y sea el gerente
# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, usuarioNom, password=None, emplCod=None, **extra_fields):
        if not usuarioNom:
            raise ValueError("El usuario debe tener un nombre")
        
        # Verificar si es el primer usuario para hacerlo superusuario
        is_first_user = not Usuario.objects.exists()
        
        if is_first_user and not emplCod:
            emplCod = self._get_or_create_default_admin()
        
        user = self.model(usuarioNom=usuarioNom, emplCod=emplCod, **extra_fields)
        user.set_password(password)
        
        if is_first_user:
            user.is_staff = True
            user.is_superuser = True
            logger.info(f"Primer usuario creado como superusuario: {usuarioNom}")
        
        user.save(using=self._db)
        return user

        
    
    def create_superuser(self, usuarioNom, password=None, emplCod=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        if not emplCod:
            emplCod = self._get_or_create_default_admin()
            
        return self.create_user(usuarioNom, password, emplCod, **extra_fields)
    
    def _get_or_create_default_admin(self):
        try:
            # Buscar empleado gerente existente
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
                    # Agregar otros campos requeridos según tu modelo Empleado
                )
                logger.info(f"Empleado Gerente por defecto creado: {empleado_gerente}")

            return empleado_gerente

        except Exception as e:
            logger.error(f"Error creando empleado por defecto: {e}")
            # Si falla, intentar obtener cualquier empleado existente
            return Empleado.objects.first()

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