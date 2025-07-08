import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode';
import { BoletaResponse } from './ventas.service';

@Injectable({
    providedIn: 'root'
})
export class GenerarComprobanteSunatService {

    constructor() { }

    private generarContenidoQR(boleta: BoletaResponse): string {
        const ruc = '12345678901'; // Aca el RUC
        const tipoDocumento = '01'; // 01   =Factura, 03=Boleta
        const serie = boleta.serie;
        const numero = boleta.correlativo;
        const igv = boleta.igv.toFixed(2);
        const total = boleta.total.toFixed(2);
        const fecha = this.formatearFechaQR(boleta.fecha_emision);
        const tipoDocCliente = boleta.cliente?.tipo_doc || '1'; // 1=DNI, 6=RUC
        const numDocCliente = boleta.cliente?.num_doc || '-';
        
        return `${ruc}|${tipoDocumento}|${serie}|${numero}|${igv}|${total}|${fecha}|${tipoDocCliente}|${numDocCliente}|`;
    }

    private async generarImagenQR(contenido: string): Promise<string> {
        try {
            // Configuración del QR
            const options = {
                width: 200,
                height: 200,
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

    //Uso de QRCode para la generacion de codigos
    async generarComprobanteSunat(boleta: BoletaResponse): Promise<void> {
        
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // 🎨 CONFIGURACIÓN DE COLORES PROFESIONALES
        const colorPrimario = [0, 102, 204];
        const colorSecundario = [102, 102, 102];
        const colorTexto = [0, 0, 0];
        const colorFondo = [240, 240, 240];
        const colorBorde = [200, 200, 200];
        
        let yPos = 20;
        
        // 📄 ENCABEZADO PRINCIPAL CON DISEÑO PROFESIONAL
        doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2]);
        doc.rect(10, 10, 190, 35, 'F');
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, 190, 35);
        
        // Logo y datos de la empresa
        doc.setFillColor(255, 255, 255);
        doc.rect(15, 15, 25, 25, 'F');
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.rect(15, 15, 25, 25);
        doc.setFontSize(8);
        doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.text('LOGO', 27.5, 30, { align: 'center' });
        
        // Información de la empresa
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        doc.text('ÓPTICA EMPRESARIAL S.A.C.', 45, 20);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.text('AV. EJEMPLO 123 - DISTRITO - PROVINCIA', 45, 25);
        doc.text('Teléfono: (01) 123-4567 | Email: info@empresa.com', 45, 29);
        doc.text('RUC: 12345678901', 45, 33);
        
        // Cuadro del tipo de comprobante
        doc.setFillColor(255, 255, 255);
        doc.rect(145, 15, 50, 25, 'F');
        doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.setLineWidth(1);
        doc.rect(145, 15, 50, 25);
        
        doc.setFontSize(8);
        doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.text('RUC: 12345678901', 170, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.text('BOLETA', 170, 26, { align: 'center' });
        doc.text('ELECTRÓNICA', 170, 31, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${boleta.serie}-${boleta.correlativo}`, 170, 36, { align: 'center' });
        
        yPos = 55;
        
        
        doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2]);
        doc.rect(10, yPos, 190, 25, 'F');
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.setLineWidth(0.5);
        doc.rect(10, yPos, 190, 25);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        doc.text('DATOS DEL CLIENTE', 15, yPos + 6);
        
        yPos += 10;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        const datosCliente = [
            { label: 'RUC/DNI:', valor: boleta.cliente?.num_doc || 'No especificado' },
            { label: 'DENOMINACIÓN:', valor: boleta.cliente?.rzn_social || 'No especificado' },
            { label: 'DIRECCIÓN:', valor: boleta.cliente?.direccion || 'No especificada' }
        ];
        
        datosCliente.forEach(dato => {
            doc.setFont('helvetica', 'bold');
            doc.text(dato.label, 15, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(dato.valor, 45, yPos);
            yPos += 4;
        });
        
        
        yPos = 65;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('FECHA EMISIÓN:', 120, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(this.formatearFecha(boleta.fecha_emision), 155, yPos);
        
        yPos += 4;
        doc.setFont('helvetica', 'bold');
        doc.text('FECHA DE VENC.:', 120, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(this.formatearFecha(boleta.fecha_emision), 155, yPos);
        
        yPos += 4;
        doc.setFont('helvetica', 'bold');
        doc.text('MONEDA:', 120, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text('SOLES', 155, yPos);
        
        yPos = 90;
        
        
        doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2]);
        doc.rect(10, yPos, 190, 8, 'F');
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.setLineWidth(0.5);
        doc.rect(10, yPos, 190, 8);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        
        const columnas = [
            { texto: 'CANT.', x: 15, ancho: 15 },
            { texto: 'U.M.', x: 30, ancho: 15 },
            { texto: 'CÓD.', x: 45, ancho: 20 },
            { texto: 'DESCRIPCIÓN', x: 65, ancho: 80 },
            { texto: 'V/U', x: 145, ancho: 20 },
            { texto: 'P.U.', x: 165, ancho: 20 },
            { texto: 'IMPORTE', x: 185, ancho: 15 }
        ];
        
        columnas.forEach(col => {
            doc.text(col.texto, col.x, yPos + 5);
            if (col.x > 15) {
                doc.line(col.x - 2, yPos, col.x - 2, yPos + 8);
            }
        });
        
        yPos += 8;
        
        
        const filas = Math.max(10, boleta.items?.length || 0);
        for (let i = 0; i < filas; i++) {
            doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
            doc.rect(10, yPos, 190, 6);
            
            if (i < (boleta.items?.length || 0)) {
                const item = boleta.items[i];
                
                console.log(`Item ${i}:`, item);
                
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
                
                const cantidadTexto = this.obtenerValorSeguro(item.cantidad, '1');
                const cantidadNumero = this.obtenerValorNumerico(item.cantidad || 1);
                const unidad = this.obtenerValorSeguro(item.unidad || item.unit || item.unidad_medida, 'NIU');
                const codigo = this.obtenerValorSeguro(item.codigo || item.code || item.id, '001');
                
                let descripcion = 'Producto/Servicio';
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
                        descripcion = item.producto_info.nombre || item.producto_info.descripcion || item.producto_info.title || 'Producto/Servicio';
                    }
                } else if (item.producto && typeof item.producto === 'string' && !item.producto.includes('object')) {
                    descripcion = item.producto;
                } else if (item.descripcion && typeof item.descripcion === 'string' && !item.descripcion.includes('object')) {
                    descripcion = item.descripcion;
                }
                
                const valorUnitario = this.obtenerValorNumerico(item.valor_unitario);
                const precioUnitario = this.obtenerValorNumerico(item.precio_unitario || item.precio_con_igv || item.precio || item.valor_unitario);
                const importe = this.obtenerValorNumerico(item.importe || item.total || item.subtotal || (cantidadNumero * precioUnitario));
                
                
                doc.text(cantidadTexto, 17, yPos + 4);
                doc.text(unidad, 32, yPos + 4);
                doc.text(codigo, 47, yPos + 4);
                
                const descripcionTexto = descripcion.length > 35 ? descripcion.substring(0, 32) + '...' : descripcion;
                doc.text(descripcionTexto, 67, yPos + 4);
                
                doc.text(valorUnitario.toFixed(2), 147, yPos + 4);
                doc.text(precioUnitario.toFixed(2), 167, yPos + 4);
                doc.text(importe.toFixed(2), 187, yPos + 4);
            }
            
            yPos += 6;
        }
        
        
        yPos += 5;
        
        doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2]);
        doc.rect(140, yPos, 60, 25, 'F');
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.rect(140, yPos, 60, 25);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        
        const totales = [
            { label: 'GRAVADA', valor: (boleta.total - boleta.igv).toFixed(2) },
            { label: 'IGV 18.00%', valor: boleta.igv.toFixed(2) },
            { label: 'TOTAL', valor: boleta.total.toFixed(2) }
        ];
        
        totales.forEach((total, index) => {
            const yPosTotal = yPos + 5 + (index * 6);
            doc.text(total.label, 145, yPosTotal);
            doc.text(`S/`, 175, yPosTotal);
            doc.text(total.valor, 195, yPosTotal, { align: 'right' });
        });
        
        
        yPos += 30;
        doc.setFillColor(colorFondo[0], colorFondo[1], colorFondo[2]);
        doc.rect(10, yPos, 190, 8, 'F');
        doc.setDrawColor(colorBorde[0], colorBorde[1], colorBorde[2]);
        doc.rect(10, yPos, 190, 8);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('IMPORTE EN LETRAS:', 15, yPos + 5);
        doc.setFont('helvetica', 'normal');
        doc.text(this.numeroALetras(boleta.total), 60, yPos + 5);
        
        
        yPos += 15;
        
        doc.setFontSize(7);
        doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.text('Representación impresa de la FACTURA ELECTRÓNICA, visita www.empresa.com/consulta', 15, yPos);
        yPos += 4;
        doc.text('Autorizado mediante Resolución de Superintendencia N° 034-005-0043315', 15, yPos);
        yPos += 4;
        doc.text(`Resumen: ${this.generarHashResumen(boleta)}`, 15, yPos);
        
        try {
            const contenidoQR = this.generarContenidoQR(boleta);
            console.log('Contenido QR:', contenidoQR);
            
            const imagenQR = await this.generarImagenQR(contenidoQR);
            
            
            const qrSize = 25;
            doc.addImage(imagenQR, 'PNG', 160, yPos - 10, qrSize, qrSize);
            
        
            doc.setFontSize(6);
            doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
            doc.text('Código QR', 172.5, yPos + 18, { align: 'center' });
            
        } catch (error) {
            console.error('Error generando QR:', error);
            
            
            const qrSize = 25;
            doc.setDrawColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            doc.setLineWidth(0.5);
            doc.rect(160, yPos - 10, qrSize, qrSize);
            
            doc.setFontSize(6);
            doc.setTextColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
            doc.text('QR ERROR', 172.5, yPos + 2, { align: 'center' });
        }
        

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

    private generarHashResumen(boleta: BoletaResponse): string {
        const data = `${boleta.serie}${boleta.correlativo}${boleta.total}`;
        return btoa(data).substring(0, 20) + '...';
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
        
        if (entero === 0) return 'CERO Y 00/100 SOLES';
        
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
        
        return `${resultado} Y ${decimal.toString().padStart(2, '0')}/100 SOLES`;
    }
}