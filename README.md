# 💼 Sistema de Automatización en Boletas Electrónicas enlazado a la SUNAT

Proyecto final para la generación de boletas electrónicas con conexión a SUNAT.  
Desarrollado con:

## 💡 Descripción

Este sistema permite escanear productos mediante código de barras y generar boletas electrónicas válidas para SUNAT.  
El proyecto está diseñado para ser escalable y organizado en 3 componentes principales:

- 🐍 **Django** (Backend)
- ⚡ **Angular** (Frontend)
- 🧾 **Greenter** (Facturación electrónica - SUNAT)

## 🔗 Flujo general

1. Escanear código de barras → obtener **ID del producto** (Todavia es una idea)
2. Consultar al **Backend (Django)** para obtener todos los detalles del producto.
3. Al confirmar, se genera la boleta y se envía al microservicio **Greenter**.
4. **Greenter** se encarga de firmar y enviar a **SUNAT**.
5. El resultado se muestra en la interfaz para el usuario.

## ⚡ Instalacion

1. 📌 git clone https://github.com/shanccom/Proyecto_IPS.git

2. 📌 Backend (Django): Cuidado donde ponen el entorno virtual
    - python -m venv venv
    - venv\Scripts\activate
    - pip install -r requirements.txt (solo tiene django por el momento)
    - cd backend
    - python manage.py migrate (Migrar la base de datos)
    - python manage.py runserver (Levantar el servidor)

3. 📌 Frontend (Angular): 
    - cd frontend
    - npm install
    - npm start

3. 📌 Servicio Boletas y DNI (PHP): OJO necesitas una version mayor a 8.2
    - cd microservicio-comprobantes
    - php -S localhost:8010 -t public
4. 📌 Greenter (Libreria de PHP para la conexion directa con la SUNAT):  https://youtu.be/6eiZ4eZ801M?si=5wTLw_HnEZwZgh9b&t=370
    
## 🔗 Tener en cuenta

Actualmente, el microservicio puede usarse de dos formas:

1. Uso en línea (versión alojada)

Puedes hacer peticiones directamente a la siguiente URL pública:

http://boleta-electronica-sunat.infy.uk/microservicio.php

⚠️ Ten en cuenta que esta versión puede tardar en responder, ya que los archivos se encuentran alojados en la nube.

------------------------------------------------------------


Requisitos:
- Tener instalado PHP: https://www.php.net/downloads.php 

Pasos para la instalación local:

