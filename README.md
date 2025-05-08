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
    - python manage.py migrate (Migrar la base de datos)
    - python manage.py runserver (Levantar el servidor)

3. 📌 Frontend (Angular): 
    - npm install
    - ng serve

4. 📌 Greenter (Libreria de PHP para la conexion directa con la SUNAT):  https://youtu.be/6eiZ4eZ801M?si=5wTLw_HnEZwZgh9b&t=370
    
## 🔗 Tener en cuenta

Actualmente, el microservicio puede usarse de dos formas:

1. Uso en línea (versión alojada)

Puedes hacer peticiones directamente a la siguiente URL pública:

http://boleta-electronica-sunat.infy.uk/microservicio.php

⚠️ Ten en cuenta que esta versión puede tardar en responder, ya que los archivos se encuentran alojados en la nube.

------------------------------------------------------------

2. Uso local con XAMPP

Requisitos:
- Tener instalado PHP: https://www.php.net/downloads.php
- Tener instalado Composer: https://getcomposer.org/
- Tener instalado XAMPP: https://www.apachefriends.org/index.html

Pasos para la instalación local:

1. Abre la carpeta 'htdocs' dentro del directorio donde instalaste XAMPP.
2. Copia allí los siguientes archivos:
   - microservicio.php
   - config.php
   - El archivo del certificado digital (.pem, .crt o .pfx)
3. Abre una terminal dentro de esa carpeta (htdocs) y ejecuta el siguiente comando:
   composer require greenter/lite
4. Inicia Apache desde el panel de control de XAMPP.
5. Utiliza una herramienta como Postman para enviar peticiones y probar el funcionamiento del microservicio.