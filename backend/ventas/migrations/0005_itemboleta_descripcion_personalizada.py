# Generated by Django 5.2 on 2025-06-22 03:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ventas', '0004_alter_itemboleta_boleta'),
    ]

    operations = [
        migrations.AddField(
            model_name='itemboleta',
            name='descripcion_personalizada',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
