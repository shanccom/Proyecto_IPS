from django.shortcuts import get_object_or_404, render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework import status

#Validacion de contraseña
from django.contrib.auth.password_validation import validate_password

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializer import BoletaElectronicaSerializer


#Comentarios = crear empleados y eliminar empleados solo a miembros del staff
#Eliminar ventas solo miembros de staff
#El resto de Views
class BoletaElectronicaCreateView(APIView):
    def post(self, request):
        serializer = BoletaElectronicaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
