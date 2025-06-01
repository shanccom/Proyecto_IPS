from django.db import models
from ventas.models import Empleado
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from rest_framework.authtoken.models import Token
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, usuarioNom, password, emplCod):
        if not usuarioNom:
            raise ValueError("El usuario debe tener un nombre")
        
        user = self.model(usuarioNom=usuarioNom, emplCod=emplCod)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, usuarioNom, password, emplCod):
        user = self.create_user(usuarioNom, password, emplCod)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser):
    usuarioNom = models.CharField(unique= True, max_length = 10)
    emplCod = models.OneToOneField(Empleado, related_name='Dueño', on_delete=models.CASCADE)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    objects = CustomUserManager()
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = "usuarioNom"
    REQUIRED_FIELDS = ["emplCod"]

    def __str__(self):
        return str( self.usuarioNom)
    