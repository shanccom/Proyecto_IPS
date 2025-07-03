from django.db import models
from ventas.models import Empleado
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from rest_framework.authtoken.models import Token
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.dispatch import receiver
from django.db.models.signals import post_save
import logging

logger = logging.getLogger(__name__)

# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, usuarioNom, password=None, emplCod=None, **extra_fields):
        if not usuarioNom:
            raise ValueError("El usuario debe tener un nombre")
        
        # Verificar si es el primer usuario para hacerlo superusuario
        is_first_user = not Usuario.objects.exists()
        
        if is_first_user and not emplCod:
            emplCod = self._get_or_create_default_admin()
            extra_fields.setdefault('is_staff', True)
            extra_fields.setdefault('is_superuser', True)
            logger.info(f"Primer usuario creado como gerente y superusuario: {usuarioNom}")
        elif not emplCod:
            raise ValueError("Se requiere emplCod para usuarios que no sean el primero")
        
        user = self.model(usuarioNom=usuarioNom, emplCod=emplCod, **extra_fields)
        user.set_password(password)
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
        """
        Crea un empleado gerente por defecto para el primer usuario del sistema
        """
        try:
            # Verificar si ya existe un empleado gerente
            empleado_gerente = Empleado.objects.filter(
                emplCarg='gerente',
                emplCond='activo'
            ).first()
            
            if empleado_gerente:
                logger.info(f"Empleado gerente existente encontrado: {empleado_gerente}")
                return empleado_gerente
            
            # Crear nuevo empleado gerente
            empleado_gerente = Empleado.objects.create(
                emplNom='Gerente Principal',
                emplCarg='gerente',
                emplCond='activo'
            )
            
            logger.info(f"Empleado gerente creado automáticamente: {empleado_gerente}")
            return empleado_gerente
            
        except Exception as e:
            logger.error(f"Error creando empleado gerente por defecto: {e}")
            raise ValueError(f"No se pudo crear el empleado gerente por defecto: {e}")

class Usuario(AbstractBaseUser, PermissionsMixin):
    usuarioNom = models.CharField(unique= True, max_length =20)
    emplCod = models.OneToOneField(Empleado, related_name='usuario', on_delete=models.CASCADE)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    objects = CustomUserManager()
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = "usuarioNom"
    REQUIRED_FIELDS = []

    def __str__(self):
        return str( self.usuarioNom)
