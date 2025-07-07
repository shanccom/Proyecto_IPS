import requests
import json
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class MicroservicioSunatService:
    def __init__(self):
        # URL de tu microservicio PHP
        self.base_url = getattr(settings, 'MICROSERVICIO_SUNAT_URL', 'http://localhost/microservicio-comprobantes/public')
    
    def enviar_boleta_sunat(self, boleta):
        """
        Envía una boleta al microservicio PHP para procesar con SUNAT
        """
        try:
            # Preparar datos en el formato que espera el microservicio
            payload = {
                'serie': boleta.serie,
                'correlativo': boleta.correlativo,
                'fecha_emision': boleta.fecha.strftime('%Y-%m-%d'),
                'cliente': {
                    'tipo_doc': '1',  # DNI por defecto
                    'num_doc': boleta.cliente.cliNumDoc,
                    'rzn_social': boleta.cliente.cliNom
                },
                'items': []
            }
            
            # Preparar items
            for item in boleta.items.all():
                item_data = {
                    'codigo': self._obtener_codigo_item(item),
                    'descripcion': item.descripcion,
                    'cantidad': int(item.cantidad),
                    'valor_unitario': float(item.valor_unitario)
                }
                payload['items'].append(item_data)
            
            logger.info(f"Enviando boleta {boleta.serie}-{boleta.correlativo} a SUNAT")
            logger.info(f"Payload: {json.dumps(payload, indent=2)}")
            
            # Enviar al microservicio
            response = requests.post(
                f'{self.base_url}/boleta',
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            logger.info(f"Respuesta del microservicio: {response.status_code}")
            logger.info(f"Contenido de respuesta: {response.text}")
            
            if response.status_code == 200:
                resultado = response.json()
                
                if resultado.get('success'):
                    # ✅ MAPEAR CORRECTAMENTE LOS CAMPOS
                    boleta.enviado_sunat = True
                    boleta.hash_sunat = resultado.get('id', '')
                    boleta.codigo_sunat = resultado.get('codigo', '')
                    boleta.mensaje_sunat = resultado.get('descripcion', '')
                    # ✅ IMPORTANTE: Mapear el nombre del CDR correctamente
                    boleta.nombre_cdr = resultado.get('nombre_cdr_zip', '')
                    boleta.fecha_envio_sunat = timezone.now()
                    boleta.estado = 'enviada'
                    boleta.save()
                    
                    logger.info(f"Boleta {boleta.id} actualizada con CDR: {boleta.nombre_cdr}")
                    
                    return {
                        'success': True,
                        'mensaje': 'Boleta enviada exitosamente a SUNAT',
                        'datos_sunat': resultado
                    }
                else:
                    # También actualizar el estado si hay error
                    boleta.mensaje_sunat = resultado.get('error', 'Error desconocido en SUNAT')
                    boleta.estado = 'error'
                    boleta.save()
                    
                    return {
                        'success': False,
                        'error': resultado.get('error', 'Error desconocido en SUNAT')
                    }
            else:
                return {
                    'success': False,
                    'error': f'Error HTTP {response.status_code}: {response.text}'
                }
                
        except requests.RequestException as e:
            logger.error(f"Error de conexión: {str(e)}")
            return {
                'success': False,
                'error': f'Error de conexión con microservicio: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Error inesperado: {str(e)}")
            return {
                'success': False,
                'error': f'Error inesperado: {str(e)}'
            }
    
    def _obtener_codigo_item(self, item):
        """
        Obtiene el código del item según su tipo
        """
        if item.descripcion_personalizada:
            return 'PERS001'  # Código genérico para productos personalizados
        elif item.content_object:
            producto = item.content_object
            # Obtener código según tipo de producto
            if hasattr(producto, 'lunaCod'):
                return producto.lunaCod
            elif hasattr(producto, 'monCod'):
                return producto.monCod
            elif hasattr(producto, 'accCod'):
                return producto.accCod
            else:
                return f'PROD{producto.pk}'
        else:
            return 'GENERICO'