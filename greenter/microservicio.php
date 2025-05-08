<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/FileStorage.php';
$fileStorage = new FileStorage();

ini_set('log_errors', 1);
ini_set('error_log', $fileStorage->getPath($fileStorage->logsDir, 'greenter_error.log'));


class NumeroALetras
{
    private static $UNIDADES = [
        '',
        'UNO ',
        'DOS ',
        'TRES ',
        'CUATRO ',
        'CINCO ',
        'SEIS ',
        'SIETE ',
        'OCHO ',
        'NUEVE ',
        'DIEZ ',
        'ONCE ',
        'DOCE ',
        'TRECE ',
        'CATORCE ',
        'QUINCE ',
        'DIECISEIS ',
        'DIECISIETE ',
        'DIECIOCHO ',
        'DIECINUEVE ',
        'VEINTE '
    ];

    private static $DECENAS = [
        'VEINTI',
        'TREINTA ',
        'CUARENTA ',
        'CINCUENTA ',
        'SESENTA ',
        'SETENTA ',
        'OCHENTA ',
        'NOVENTA ',
        'CIEN '
    ];

    private static $CENTENAS = [
        'CIENTO ',
        'DOSCIENTOS ',
        'TRESCIENTOS ',
        'CUATROCIENTOS ',
        'QUINIENTOS ',
        'SEISCIENTOS ',
        'SETECIENTOS ',
        'OCHOCIENTOS ',
        'NOVECIENTOS '
    ];

    public static function convertir($number, $moneda = '', $centimos = '')
    {
        $converted = '';
        $decimales = '';

        if (($number < 0) || ($number > 999999999)) {
            return 'No es posible convertir el número a letras';
        }

        $div_decimales = explode('.', $number);

        if (count($div_decimales) > 1) {
            $number = $div_decimales[0];
            $decNumberStr = (string)$div_decimales[1];
            if (strlen($decNumberStr) == 2) {
                $decNumberStrFill = str_pad($decNumberStr, 9, '0', STR_PAD_LEFT);
                $decCientos = substr($decNumberStrFill, 6);
                $decimales = self::convertGroup($decCientos);
            }
        }

        $numberStr = (string)$number;
        $numberStrFill = str_pad($numberStr, 9, '0', STR_PAD_LEFT);
        $millones = substr($numberStrFill, 0, 3);
        $miles = substr($numberStrFill, 3, 3);
        $cientos = substr($numberStrFill, 6);

        if (intval($millones) > 0) {
            if ($millones == '001') {
                $converted .= 'UN MILLON ';
            } else if (intval($millones) > 0) {
                $converted .= sprintf('%sMILLONES ', self::convertGroup($millones));
            }
        }

        if (intval($miles) > 0) {
            if ($miles == '001') {
                $converted .= 'MIL ';
            } else if (intval($miles) > 0) {
                $converted .= sprintf('%sMIL ', self::convertGroup($miles));
            }
        }

        if (intval($cientos) > 0) {
            if ($cientos == '001') {
                $converted .= 'UN ';
            } else if (intval($cientos) > 0) {
                $converted .= sprintf('%s ', self::convertGroup($cientos));
            }
        }

        if (empty($decimales)) {
            $valor_convertido = $converted . strtoupper($moneda);
        } else {
            $valor_convertido = $converted . strtoupper($moneda) . ' CON ' . $decimales . ' ' . strtoupper($centimos);
        }

        return $valor_convertido;
    }

    private static function convertGroup($n)
    {
        $output = '';

        if ($n == '100') {
            $output = "CIEN ";
        } else if ($n[0] !== '0') {
            $output = self::$CENTENAS[$n[0] - 1];
        }

        $k = intval(substr($n, 1));

        if ($k <= 20) {
            $output .= self::$UNIDADES[$k];
        } else {
            if (($k > 20) && ($k < 30)) {
                $output .= self::$DECENAS[0] . self::$UNIDADES[$k - 20];
            } else {
                $output .= self::$DECENAS[substr($n, 1, 1) - 2];

                if (substr($n, 2, 1) !== '0') {
                    $output .= 'Y ' . self::$UNIDADES[substr($n, 2, 1)];
                }
            }
        }

        return $output;
    }
}

header('Content-Type: application/json');

use Greenter\Model\Client\Client;
use Greenter\Model\Company\Company;
use Greenter\Model\Company\Address;
use Greenter\Model\Sale\FormaPagos\FormaPagoContado;
use Greenter\Model\Sale\Invoice;
use Greenter\Model\Sale\SaleDetail;
use Greenter\Model\Sale\Legend;

try {
    require __DIR__.'/vendor/autoload.php';
    $see = require __DIR__.'/config.php';

    define('IGV_PERCENT', 18);

    $data = json_decode(file_get_contents("php://input"), true);

    // Registrar los datos recibidos para depuración
    $fileStorage->log("Datos recibidos: " . print_r($data, true), "debug");

    if (!$data || empty($data['cliente']) || empty($data['items'])) {
        echo json_encode(["success" => false, "message" => "Datos incompletos"]);
        exit;
    }

    $client = (new Client())
        ->setTipoDoc($data['cliente']['tipo_doc'])
        ->setNumDoc($data['cliente']['num_doc'])
        ->setRznSocial($data['cliente']['rzn_social']);

    // Emisor
    $address = (new Address())
        ->setUbigueo('040101')
        ->setDepartamento('AREQUIPA')
        ->setProvincia('AREQUIPA')
        ->setDistrito('AREQUIPA')
        ->setUrbanizacion('-')
        ->setDireccion('Av. Ejemplo 123 - Cercado')
        ->setCodLocal('0000');

    $company = (new Company())
        ->setRuc('20452578957')
        ->setRazonSocial('EMPRESA SAC')
        ->setNombreComercial('EMPRESA')
        ->setAddress($address);

    $invoice = (new Invoice())
        ->setUblVersion('2.1')
        ->setTipoOperacion('0101')
        ->setTipoDoc($data['tipo_comprobante'])
        ->setSerie($data['serie'])
        ->setCorrelativo($data['correlativo'])
        ->setFechaEmision(new DateTime('now', new DateTimeZone('America/Lima')))
        ->setFormaPago(new FormaPagoContado())
        ->setTipoMoneda('PEN')
        ->setCompany($company)
        ->setClient($client);

    $items = [];
    $valorTotal = 0;
    $igvTotal = 0;

    foreach ($data['items'] as $i) {
        // Asegurarse de que los valores sean numéricos
        $cantidad = is_numeric($i['cantidad']) ? floatval($i['cantidad']) : 0;
        $valorUnitario = is_numeric($i['valor_unitario']) ? floatval($i['valor_unitario']) : 0;
        
        $baseIgv = $cantidad * $valorUnitario;
        $igvMonto = $baseIgv * IGV_PERCENT / 100;

        $item = (new SaleDetail())
            ->setCodProducto($i['codigo'])
            ->setUnidad($i['unidad'])
            ->setCantidad($cantidad)
            ->setDescripcion($i['descripcion'])
            ->setMtoValorUnitario($valorUnitario)
            ->setMtoBaseIgv($baseIgv)
            ->setPorcentajeIgv(IGV_PERCENT)
            ->setIgv($igvMonto)
            ->setTipAfeIgv('10')
            ->setTotalImpuestos($igvMonto)
            ->setMtoValorVenta($baseIgv)
            ->setMtoPrecioUnitario($valorUnitario * (1 + IGV_PERCENT / 100));

        $valorTotal += $baseIgv;
        $igvTotal += $igvMonto;

        $items[] = $item;
    }

    $invoice->setDetails($items)
            ->setMtoOperGravadas($valorTotal)
            ->setMtoIGV($igvTotal)
            ->setTotalImpuestos($igvTotal)
            ->setValorVenta($valorTotal)
            ->setSubTotal($valorTotal + $igvTotal)
            ->setMtoImpVenta($valorTotal + $igvTotal);

    $legend = (new Legend())
        ->setCode('1000')
        ->setValue('SON '.strtoupper(num2letras($valorTotal + $igvTotal)).' SOLES');

    $invoice->setLegends([$legend]);

    // Enviar a SUNAT
    try {
        $result = $see->send($invoice);
    } catch (Exception $e) {
        $fileStorage->log("Error al enviar: " . $e->getMessage(), "error");
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => 'EXCEPTION',
                'message' => $e->getMessage()
            ]
        ]);
        exit();
    }

    // Guardar el XML
    $xmlPath = $fileStorage->saveXml($invoice->getName().'.xml', $see->getFactory()->getLastXml());
    $fileStorage->log("XML guardado en: " . $xmlPath, "info");

    if (!$result->isSuccess()) {
        $fileStorage->log("Error de SUNAT: " . $result->getError()->getCode() . " - " . $result->getError()->getMessage(), "error");
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => $result->getError()->getCode(),
                'message' => $result->getError()->getMessage()
            ]
        ]);
        exit();
    }

    // Guardar el CDR
    $cdrPath = $fileStorage->saveCdr('R-'.$invoice->getName().'.zip', $result->getCdrZip());
    $fileStorage->log("CDR guardado en: " . $cdrPath, "info");

    $cdr = $result->getCdrResponse();
    $code = (int)$cdr->getCode();

    $response = [
        'success' => true,
        'cdr_code' => $code,
        'cdr_description' => $cdr->getDescription(),
        'status' => $code === 0 ? 'ACEPTADA' : ($code >= 2000 ? 'RECHAZADA' : 'OBSERVAR'),
        'notes' => $cdr->getNotes(),
        'xml_path' => $xmlPath,
        'cdr_path' => $cdrPath
    ];

    $fileStorage->log("Comprobante procesado correctamente: " . $invoice->getSerie() . "-" . $invoice->getCorrelativo(), "info");
    echo json_encode($response);

} catch (Exception $e) {
    if (isset($fileStorage)) {
        $fileStorage->log("Error general: " . $e->getMessage(), "error");
    } else {
        file_put_contents('error_critico.log', date('Y-m-d H:i:s') . " - " . $e->getMessage() . "\n", FILE_APPEND);
    }
    
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 'GENERAL_EXCEPTION',
            'message' => $e->getMessage()
        ]
    ]);
    exit();
}

function num2letras($num) {
    return NumeroALetras::convertir($num, 'SOLES', 'CENTIMOS');
}