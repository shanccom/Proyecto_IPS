from django.db import models
from django.utils import timezone

# Create your models here.
# Aca ira modelo de cliente, receta 
class Cliente(models.Model):
    TIPO_DOCUMENTOS = [
        ('DNI', 'dni'),
        ('Pasaporte', 'pasaporte'),
    ]
    cliCod = models.AutoField(primary_key=True)
    cliNombComp = models.CharField(max_length = 50)
    cliTipoDoc = models.CharField(max_length=20, choices = TIPO_DOCUMENTOS, default='DNI')
    cliNumDoc = models.CharField(max_length=9, null=True, blank=True)
    cliNumCel = models.CharField(max_length = 9, null=True, blank=True)
    cliEdad = models.IntegerField(null=True)

#El codigo de receta inicia con el año que fue emitida
class Receta(models.Model):
    cliCod = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='recetas')
    rectOpt = models.BooleanField(default=False)
    recfecha = models.DateField(default=timezone.now)
    #Medidas de ojo Derecho
    recOD_sph = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    recOD_cyl = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    recOD_eje = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    # Medidas de ojo Izquierdo
    recOI_sph = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    recOI_cyl = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    #acepta 170
    recOI_eje = models.DecimalField(max_digits=5,decimal_places=1, null=True, blank=True)
    # Distancia Interpupilar para campo de visión correcta
    recDIPLejos = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    recDIPCerca = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    #Adicion para presbicia
    rec_adicion = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    recObsAdic = models.CharField(max_length=50, null=True, blank=True)
    
    recCod= models.CharField(max_length=50, unique=True, editable=False)

    def save(self, *args, **kwargs):
        if not self.recCod:
            año = self.recfecha.year
            total_ese_año = Receta.objects.filter(recfecha__year=año).count() + 1
            self.recCod = f"{año}-{total_ese_año:04d}"  # Ej: 2025-0001
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Receta {self.recCod} - {self.cliCod.cliNombComp}"