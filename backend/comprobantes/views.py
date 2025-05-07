from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Comprobante
from .serializers import ComprobanteSerializer
import requests
import json
import logging

# Configurar logging
logger = logging.getLogger(__name__)

class ComprobanteViewSet(viewsets.ModelViewSet):
    queryset = Comprobante.objects.all()
    serializer_class = ComprobanteSerializer

    @action(detail=True, methods=['post'])
    def enviar_sunat(self, request, pk=None):
        comprobante = self.get_object()
        venta = comprobante.venta
        cliente = venta.cliente

        data = {
            "cliente": {
                "tipo_doc": cliente.tipo_doc,  # Ej: "6" para RUC, "1" para DNI
                "num_doc": cliente.num_doc,
                "rzn_social": cliente.rzn_social,
            },
            "tipo_comprobante": comprobante.tipo_comprobante,  # "01" para factura, "03" para boleta
            "serie": comprobante.serie,
            "correlativo": comprobante.correlativo,
            "items": []
        }

        # Imprimir los detalles del comprobante para depuración
        logger.debug("Detalles del comprobante: %s", comprobante.detalles.all())

        for detalle in comprobante.detalles.all():
            logger.debug(f"Detalle ID: {detalle.id}, Tipo Producto: {detalle.tipo_producto}")

            if detalle.tipo_producto == "accesorio" and detalle.producto_accesorio:
                producto = detalle.producto_accesorio
            elif detalle.tipo_producto == "montura" and detalle.producto_montura:
                producto = detalle.producto_montura
            elif detalle.tipo_producto == "luna" and detalle.producto_luna:
                producto = detalle.producto_luna
            else:
                logger.error(f"Producto no definido para detalle {detalle.id}")
                return Response({"error": f"Producto no definido para detalle {detalle.id}"}, status=400)

            try:
                precio = float(detalle.precio_unitario)
                
                item = {
                    "codigo": producto.codigo,
                    "unidad": "NIU",  # Unidad de medida (en este caso, "NIU" para unidades)
                    "cantidad": float(detalle.cantidad),
                    "descripcion": producto.descripcion,
                    "valor_unitario": precio,  # Usar valor numérico, no string
                }
                data["items"].append(item)
            except (ValueError, TypeError) as e:
                logger.error(f"Error al convertir precio: {e}")
                return Response({"error": f"Error en formato de precio: {e}"}, status=400)

        logger.info("Datos que se enviarán a SUNAT: %s", json.dumps(data))

        try:
            logger.info("Enviando datos a microservicio en: http://localhost/sunat/microservicio.php")
            response = requests.post("http://localhost/sunat/microservicio.php", json=data)

            logger.info("Respuesta cruda de SUNAT: %s", response.text)
            logger.info("Código estado HTTP: %s", response.status_code)

            if response.status_code == 200:
                try:
                    resp_json = response.json()
                    logger.info("Respuesta JSON: %s", resp_json)

                    # Si la respuesta de SUNAT es exitosa
                    if resp_json.get("success"):
                        comprobante.estado_sunat = 'enviado'  
                        comprobante.save()  
                        return Response({"mensaje": "Enviado correctamente a SUNAT"}, status=200)
                    else:
                        logger.error("SUNAT devolvió error: %s", resp_json)
                        comprobante.estado_sunat = 'observado'
                        comprobante.save()
                        return Response({"error": "SUNAT devolvió error", "detalle": resp_json}, status=400)
                except ValueError as e:
                    logger.error("Respuesta no es JSON válido: %s", e)
                    logger.error("Texto de respuesta: %s", response.text)
                    return Response({"error": "Respuesta de SUNAT no es un JSON válido", "detalle": response.text}, status=500)
            else:
                logger.error("Error en respuesta HTTP: %s", response.status_code)
                logger.error("Contenido respuesta: %s", response.text)
                return Response({"error": "Error al contactar con SUNAT", "status_code": response.status_code}, status=500)
        except Exception as e:

            logger.error("Excepción general: %s", str(e), exc_info=True)
            return Response({"error": str(e)}, status=500)