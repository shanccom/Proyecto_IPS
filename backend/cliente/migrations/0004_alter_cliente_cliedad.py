# Generated by Django 5.2 on 2025-05-08 17:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cliente', '0003_rename_edad_cliente_cliedad'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cliente',
            name='cliEdad',
            field=models.IntegerField(null=True),
        ),
    ]
