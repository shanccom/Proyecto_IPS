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

1. Escanear código de barras → obtener **ID del producto**.
2. Consultar al **Backend (Django)** para obtener todos los detalles del producto.
3. Al confirmar, se genera la boleta y se envía al microservicio **Greenter**.
4. **Greenter** se encarga de firmar y enviar a **SUNAT**.
5. El resultado se muestra en la interfaz para el usuario.
