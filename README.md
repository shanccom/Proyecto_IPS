# 💼 Sistema de Boletas Electrónicas

Proyecto final para la generación de boletas electrónicas con conexión a SUNAT.  
Desarrollado con:

## 💡 Descripción

Este sistema permite escanear productos mediante código de barras y generar boletas electrónicas válidas para SUNAT.  
El proyecto está diseñado para ser escalable y organizado en 3 componentes principales:

- 🐍 **Django** (Backend)
- ⚡ **Angular + Tailwind** (Frontend)
- 🧾 **Greenter** (Facturación electrónica - SUNAT)
- 📦 **En duda** (Base de datos)

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

