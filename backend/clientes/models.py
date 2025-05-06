from django.db import models

class Cliente(models.Model):
    TIPO_DOC_CHOICES = [
        ('1', 'DNI'),
        ('6', 'RUC'),
    ]

    tipo_doc = models.CharField(max_length=1, choices=TIPO_DOC_CHOICES) # Sera DNI o RUC, podriamos ampliarlo a carnet de extranjeria tmb
    num_doc = models.CharField(max_length=11, unique=True)
    rzn_social = models.CharField(max_length=100)  # Nombre o razón social
    direccion = models.CharField(max_length=150, blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return f"{self.rzn_social} ({self.num_doc})"
