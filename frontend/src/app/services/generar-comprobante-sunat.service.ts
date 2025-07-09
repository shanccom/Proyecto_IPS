import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode';
import { BoletaResponse } from './ventas.service';
import { DATOS_EMPRESA } from '../constants/empresa.constants';

@Injectable({
    providedIn: 'root'
})
export class GenerarComprobanteSunatService {

    constructor() { }

    private generarContenidoQR(boleta: BoletaResponse): string {
        const ruc = DATOS_EMPRESA.ruc; 
        const tipoDocumento = '03'; // 01=Factura, 03=Boleta
        const serie = boleta.serie;
        const numero = boleta.correlativo;
        const igv = boleta.igv.toFixed(2);
        const total = boleta.total.toFixed(2);
        const fecha = this.formatearFechaQR(boleta.fecha_emision);
        const tipoDocCliente = boleta.cliente?.tipo_doc || '1'; // 1=DNI, 6=RUC
        const numDocCliente = boleta.cliente?.num_doc || '00000000';
        
        return `${ruc}|${tipoDocumento}|${serie}|${numero}|${igv}|${total}|${fecha}|${tipoDocCliente}|${numDocCliente}|`;
    }

    private async generarImagenQR(contenido: string): Promise<string> {
        try {
            const options = {
                width: 150,
                height: 150,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M' as const,
                type: 'image/png' as const
            };

            const qrDataURL = await QRCode.toDataURL(contenido, options);
            return qrDataURL;
            
        } catch (error) {
            console.error('Error generando QR:', error);
            throw error;
        }
    }

    async generarComprobanteSunat(boleta: BoletaResponse): Promise<void> {
        
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Colores del diseño
        const colorTexto = [0, 0, 0];
        const colorBorde = [0, 0, 0];
        const colorFondo = [240, 240, 240];
        const colorAzul = [0, 51, 102];
        const colorVerde = [0, 153, 0];
        
        let yPos = 15;
        
        // ENCABEZADO CON LOGO Y DATOS DE LA EMPRESA
        // Espacio para logo de la empresa
        doc.setFillColor(255, 255, 255);
        doc.rect(20, yPos, 40, 25, 'F');
        
        // Agregar el logo de la empresa
        if (DATOS_EMPRESA.LOGO_EMPRESA) {
            try {
                doc.addImage(DATOS_EMPRESA.LOGO_EMPRESA, 'PNG', 20, yPos, 40, 25);
            } catch (error) {
                console.error('Error al cargar el logo:', error);
                // Fallback: mostrar texto si falla la imagen
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text('LOGO EMPRESA', 40, yPos + 15, { align: 'center' });
            }
        } else {
            // Fallback: mostrar texto si no hay logo
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('LOGO EMPRESA', 40, yPos + 15, { align: 'center' });
        }
        
        // Datos de la empresa (CENTRADOS entre logo y cuadro RUC)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        doc.text(DATOS_EMPRESA.razon_social, 102.5, yPos + 6, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(DATOS_EMPRESA.direccion, 102.5, yPos + 11, { align: 'center' });
        doc.text(`Teléfono: ${DATOS_EMPRESA.telefono}`, 102.5, yPos + 15, { align: 'center' });
        doc.text(`Email: ${DATOS_EMPRESA.email}`, 102.5, yPos + 19, { align: 'center' });
        doc.text(`${DATOS_EMPRESA.lema}`, 102.5, yPos + 23, { align: 'center' });
        
        // Cuadro RUC y tipo de documento (derecha)
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.setLineWidth(0.8);
        doc.roundedRect(145, yPos, 50, 25, 2, 2);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        doc.text(`RUC ${DATOS_EMPRESA.ruc}`, 170, yPos + 6, { align: 'center' });
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('BOLETA DE VENTA', 170, yPos + 12, { align: 'center' });
        doc.text('ELECTRÓNICA', 170, yPos + 17, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${boleta.serie}-${boleta.correlativo}`, 170, yPos + 22, { align: 'center' });
        
        // Datos del cliente y fecha - REDUCIDO EL ESPACIO
        yPos = 50; // Cambiado de 75 a 50 para reducir el espacio
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.setLineWidth(0.5);
        doc.rect(20, yPos, 175, 25);
        
        // Datos del cliente (izquierda)
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('CLIENTE:', 22, yPos + 5);
        doc.text('DNI:', 22, yPos + 10);
        doc.text('DIRECCIÓN:', 22, yPos + 15);
        
        doc.setFont('helvetica', 'normal');
        doc.text(boleta.cliente?.rzn_social || 'CLIENTES VARIOS', 40, yPos + 5);
        doc.text(boleta.cliente?.num_doc || '00000000', 40, yPos + 10);
        doc.text(boleta.cliente?.direccion || 'Sin dirección', 40, yPos + 15);
        
        // Fecha y otros datos (derecha)
        doc.setFont('helvetica', 'bold');
        doc.text('FECHA EMISIÓN:', 110, yPos + 5);
        doc.text('FECHA VENCIMIENTO:', 110, yPos + 10);
        doc.text('MONEDA:', 110, yPos + 15);
        doc.text('FORMA DE PAGO:', 110, yPos + 20);
        
        doc.setFont('helvetica', 'normal');
        doc.text(this.formatearFecha(boleta.fecha_emision), 155, yPos + 5);
        doc.text(this.formatearFecha(boleta.fecha_emision), 155, yPos + 10);
        doc.text('SOLES', 155, yPos + 15);
        doc.text('CONTADO', 155, yPos + 20);
        
        // Tabla de productos - AJUSTADO LA POSICIÓN
        yPos = 85; // Cambiado de 110 a 85
        
        // Encabezado de la tabla
        doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2]);
        doc.rect(20, yPos, 175, 8, 'F');
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.setLineWidth(0.5);
        doc.rect(20, yPos, 175, 8);
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        
        // Líneas verticales y headers ajustados
        const columnas = [
            { texto: 'N°', x: 22, ancho: 8 },
            { texto: 'CANT.', x: 32, ancho: 12 },
            { texto: 'UNIDAD', x: 46, ancho: 18 },
            { texto: 'CÓDIGO', x: 66, ancho: 18 },
            { texto: 'DESCRIPCIÓN', x: 86, ancho: 50 },
            { texto: 'IGV', x: 138, ancho: 12 },
            { texto: 'P.UNIT.', x: 152, ancho: 15 },
            { texto: 'TOTAL', x: 169, ancho: 15 },
            { texto: 'LOTE', x: 186, ancho: 9 }
        ];
        
        // Dibujar headers
        columnas.forEach((col, index) => {
            doc.text(col.texto, col.x, yPos + 5);
            if (index > 0) {
                doc.line(col.x - 1, yPos, col.x - 1, yPos + 8);
            }
        });
        
        yPos += 8;
        
        // Filas de productos
        const filas = Math.max(10, boleta.items?.length || 0);
        for (let i = 0; i < filas; i++) {
            doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
            doc.rect(20, yPos, 175, 6);
            
            if (i < (boleta.items?.length || 0)) {
                const item = boleta.items[i];
                
                doc.setFontSize(6);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
                
                const cantidadNumero = this.obtenerValorNumerico(item.cantidad || 1);
                const unidad = this.obtenerValorSeguro(item.unidad || item.unit || item.unidad_medida, 'UNIDAD');
                const codigo = this.obtenerValorSeguro(item.codigo || item.code || item.id, 'P00000');
                
                let descripcion = 'Producto genérico';
                if (item.producto_info && typeof item.producto_info === 'object') {
                    const codigo = item.producto_info.codigo || '';
                    const tipo = item.producto_info.tipo || '';
                    
                    if (codigo && tipo) {
                        descripcion = `${codigo} - ${tipo}`;
                    } else if (codigo) {
                        descripcion = codigo;
                    } else if (tipo) {
                        descripcion = tipo;
                    } else {
                        descripcion = item.producto_info.nombre || item.producto_info.descripcion || item.producto_info.title || descripcion;
                    }
                } else if (item.producto && typeof item.producto === 'string' && !item.producto.includes('object')) {
                    descripcion = item.producto;
                } else if (item.descripcion && typeof item.descripcion === 'string' && !item.descripcion.includes('object')) {
                    descripcion = item.descripcion;
                }
                
                const igvItem = this.obtenerValorNumerico(item.igv || (item.precio_unitario || item.precio_con_igv || item.precio || item.valor_unitario) * 0.18);
                const precioUnitario = this.obtenerValorNumerico(item.precio_unitario || item.precio_con_igv || item.precio || item.valor_unitario);
                const total = this.obtenerValorNumerico(item.importe || item.total || item.subtotal || (cantidadNumero * precioUnitario));
                
                // Dibujar líneas verticales
                columnas.forEach((col, index) => {
                    if (index > 0) {
                        doc.line(col.x - 1, yPos, col.x - 1, yPos + 6);
                    }
                });
                
                // Contenido de las celdas
                doc.text((i + 1).toString(), 26, yPos + 4, { align: 'center' });
                doc.text(cantidadNumero.toString(), 38, yPos + 4, { align: 'center' });
                doc.text(unidad.substring(0, 6), 55, yPos + 4, { align: 'center' });
                doc.text(codigo.substring(0, 8), 75, yPos + 4, { align: 'center' });
                
                const descripcionTexto = descripcion.length > 30 ? descripcion.substring(0, 27) + '...' : descripcion;
                doc.text(descripcionTexto, 88, yPos + 4);
                
                doc.text(igvItem.toFixed(2), 144, yPos + 4, { align: 'center' });
                doc.text(precioUnitario.toFixed(2), 159, yPos + 4, { align: 'center' });
                doc.text(total.toFixed(2), 176, yPos + 4, { align: 'center' });
                doc.text('00000', 190, yPos + 4, { align: 'center' }); // LOTE por defecto
            } else {
                // Dibujar líneas verticales para filas vacías
                columnas.forEach((col, index) => {
                    if (index > 0) {
                        doc.line(col.x - 1, yPos, col.x - 1, yPos + 6);
                    }
                });
            }
            
            yPos += 6;
        }
        
        // IMPORTE EN LETRAS - AJUSTADO LA POSICIÓN
        yPos += 5;
        
        // Caja para el total en letras (lado derecho)
        doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2]);
        doc.rect(110, yPos, 85, 18, 'F');
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.rect(110, yPos, 85, 18);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        
        const textoEnLetras = this.numeroALetras(boleta.total);
        const maxCaracteres = 35;
        
        if (textoEnLetras.length > maxCaracteres) {
            // Dividir en dos líneas
            const palabras = textoEnLetras.split(' ');
            let linea1 = '';
            let linea2 = '';
            
            let i = 0;
            while (i < palabras.length && (linea1 + palabras[i]).length <= maxCaracteres) {
                linea1 += (linea1 ? ' ' : '') + palabras[i];
                i++;
            }
            
            while (i < palabras.length) {
                linea2 += (linea2 ? ' ' : '') + palabras[i];
                i++;
            }
            
            doc.text('SON:', 112, yPos + 6);
            doc.text(linea1, 112, yPos + 10);
            doc.text(linea2, 112, yPos + 14);
        } else {
            doc.text('SON: ' + textoEnLetras, 112, yPos + 11);
        }
        
        // Observaciones (lado izquierdo)
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.rect(20, yPos, 85, 18);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 22, yPos + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Sin observaciones', 22, yPos + 11);
        
        // Sección inferior con información bancaria y totales - AJUSTADO
        yPos += 25;
        
        // Información bancaria (izquierda) - usando constantes
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Cuentas Bancarias:', 22, yPos);
        
        let yBanco = yPos + 4;
        DATOS_EMPRESA.cuentas_bancarias.forEach((cuenta) => {
            doc.text(cuenta.banco, 22, yBanco);
            doc.text(`CTA CTE: ${cuenta.cuenta}`, 22, yBanco + 3);
            doc.text(`CCI: ${cuenta.cci}`, 22, yBanco + 6);
            yBanco += 12;
        });
        
        // Totales (derecha)
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.rect(140, yPos, 55, 35);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        const gravada = boleta.total - boleta.igv;
        const totales = [
            { label: 'OP. GRAVADAS:', valor: gravada.toFixed(2) },
            { label: 'OP. EXONERADAS:', valor: '0.00' },
            { label: 'OP. INAFECTAS:', valor: '0.00' },
            { label: 'OP. GRATUITAS:', valor: '0.00' },
            { label: 'SUB TOTAL:', valor: gravada.toFixed(2) },
            { label: 'DESCUENTOS TOTAL:', valor: '0.00' },
            { label: 'IGV 18%:', valor: boleta.igv.toFixed(2) },
            { label: 'ICBPER:', valor: '0.00' },
            { label: 'ADELANTOS:', valor: '0.00' }
        ];
        
        let yTotal = yPos + 3;
        totales.forEach((total) => {
            doc.text(total.label, 142, yTotal);
            doc.text('S/', 175, yTotal);
            doc.text(total.valor, 192, yTotal, { align: 'right' });
            yTotal += 3.5;
        });
        
        // Total final
        doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2]);
        doc.rect(140, yTotal, 55, 8, 'F');
        doc.rect(140, yTotal, 55, 8);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL: S/', 160, yTotal + 5);
        doc.text(boleta.total.toFixed(2), 192, yTotal + 5, { align: 'right' });
        
        // QR Code (centro-abajo) - AJUSTADO
        const qrYPosition = yPos + 5;
        
        try {
            const contenidoQR = this.generarContenidoQR(boleta);
            console.log('Contenido QR:', contenidoQR);
            
            const imagenQR = await this.generarImagenQR(contenidoQR);
            const qrSize = 30;
            doc.addImage(imagenQR, 'PNG', 90, qrYPosition, qrSize, qrSize);
            
        } catch (error) {
            console.error('Error generando QR:', error);
            const qrSize = 30;
            doc.setDrawColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            doc.setLineWidth(0.5);
            doc.rect(90, qrYPosition, qrSize, qrSize);
            doc.setFontSize(6);
            doc.text('QR ERROR', 105, qrYPosition + 15, { align: 'center' });
        }
        
        // Pie de página - AJUSTADO
        const piePaginaY = qrYPosition + 40;
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text('Representación impresa de la BOLETA DE VENTA ELECTRÓNICA. Autorizado mediante resolución N° 054-005-0004318 /SUNAT. Consulte su comprobante en', 20, piePaginaY + 3);
        
        // SmartClic branding
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('RegistraMe', 105, piePaginaY + 12, { align: 'center' });
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text('Comprobante emitido a través de www.RegistraMe.pe', 105, piePaginaY + 16, { align: 'center' });

        const nombreArchivo = `Boleta_${boleta.serie}_${boleta.correlativo}.pdf`;
        doc.save(nombreArchivo);
    }

    private obtenerValorSeguro(valor: any, valorPorDefecto: string): string {
        if (valor === null || valor === undefined) {
            return valorPorDefecto;
        }
        
        if (typeof valor === 'string') {
            if (valor.includes('object (') || valor.includes('[object')) {
                return valorPorDefecto;
            }
            return valor;
        }
        
        if (typeof valor === 'number') {
            return valor.toString();
        }
        
        if (typeof valor === 'object') {
            const propiedades = ['nombre', 'descripcion', 'text', 'value', 'title', 'label'];
            for (const prop of propiedades) {
                if (valor[prop] && typeof valor[prop] === 'string') {
                    return valor[prop];
                }
            }
            return valorPorDefecto;
        }
        
        return valor.toString();
    }

    private obtenerValorNumerico(valor: any): number {
        if (valor === null || valor === undefined || valor === '') {
            return 0;
        }
        
        if (typeof valor === 'number') {
            return valor;
        }
        
        if (typeof valor === 'string') {
            const numeroParseado = parseFloat(valor.replace(/[^0-9.-]/g, ''));
            return isNaN(numeroParseado) ? 0 : numeroParseado;
        }
        
        if (typeof valor === 'object') {
            return this.obtenerValorNumerico(valor.value || valor.precio || valor.monto || 0);
        }
        
        return 0;
    }

    private formatearFecha(fecha: string): string {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    private formatearFechaQR(fecha: string): string {
        const fechaObj = new Date(fecha);
        return fechaObj.toISOString().split('T')[0];
    }

    private numeroALetras(numero: number): string {
        let entero = Math.floor(numero);
        const decimal = Math.round((numero - entero) * 100);
        
        if (entero === 0) return 'CERO CON 00/100 SOLES';
        
        const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
        const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
        const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
        const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
        
        const convertirGrupo = (num: number): string => {
            if (num === 0) return '';
            
            let resultado = '';
            
            const cen = Math.floor(num / 100);
            if (cen > 0) {
                if (cen === 1 && num === 100) {
                    resultado = 'CIEN';
                } else {
                    resultado = centenas[cen];
                }
            }
            
            const resto = num % 100;
            if (resto > 0) {
                if (resultado) resultado += ' ';
                
                if (resto < 10) {
                    resultado += unidades[resto];
                } else if (resto < 20) {
                    resultado += especiales[resto - 10];
                } else {
                    const dec = Math.floor(resto / 10);
                    const uni = resto % 10;
                    
                    if (dec === 2 && uni > 0) {
                        resultado += 'VEINTI' + unidades[uni];
                    } else {
                        resultado += decenas[dec];
                        if (uni > 0) {
                            resultado += ' Y ' + unidades[uni];
                        }
                    }
                }
            }
            
            return resultado;
        };
        
        let resultado = '';
        
        if (entero >= 1000000) {
            const millones = Math.floor(entero / 1000000);
            if (millones === 1) {
                resultado += 'UN MILLON ';
            } else {
                resultado += convertirGrupo(millones) + ' MILLONES ';
            }
            entero %= 1000000;
        }
        
        if (entero >= 1000) {
            const miles = Math.floor(entero / 1000);
            if (miles === 1) {
                resultado += 'MIL ';
            } else {
                resultado += convertirGrupo(miles) + ' MIL ';
            }
            entero %= 1000;
        }
        
        if (entero > 0) {
            resultado += convertirGrupo(entero);
        }
        
        resultado = resultado.trim();
        
        return `${resultado} CON ${decimal.toString().padStart(2, '0')}/100 SOLES`;
    }
}