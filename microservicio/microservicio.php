<?php

header('Content-Type: application/json');

use Greenter\Model\Client\Client;
use Greenter\Model\Company\Company;
use Greenter\Model\Company\Address;
use Greenter\Model\Sale\FormaPagos\FormaPagoContado;
use Greenter\Model\Sale\Invoice;
use Greenter\Model\Sale\SaleDetail;
use Greenter\Model\Sale\Legend;

require __DIR__.'/vendor/autoload.php';
$see = require __DIR__.'/config.php';

define('IGV_PERCENT', 18);

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['cliente']) || empty($data['tipo_comprobante']) || empty($data['serie']) || empty($data['correlativo'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit();
}

$client = (new Client())
    ->setTipoDoc($data['cliente']['tipo_doc']) // Ej: "6" para RUC, "1" para DNI
    ->setNumDoc($data['cliente']['num_doc'])  // Ej: "20123456789"
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
    ->setRuc('20123456789')
    ->setRazonSocial('EMPRESA SAC')
    ->setNombreComercial('EMPRESA')
    ->setAddress($address);

$invoice = (new Invoice())
    ->setUblVersion('2.1')
    ->setTipoOperacion('0101')
    ->setTipoDoc($data['tipo_comprobante']) // Ej: "01" para factura, "03" para boleta
    ->setSerie($data['serie'])              // Ej: "F001"
    ->setCorrelativo($data['correlativo'])  // Ej: "123"
    ->setFechaEmision(new DateTime('now', new DateTimeZone('America/Lima')))
    ->setFormaPago(new FormaPagoContado())
    ->setTipoMoneda('PEN')
    ->setCompany($company)
    ->setClient($client);

$items = [];
$valorTotal = 0;
$igvTotal = 0;

foreach ($data['items'] as $i) {
    $baseIgv = $i['cantidad'] * $i['valor_unitario'];
    $igvMonto = $baseIgv * IGV_PERCENT / 100;

    $item = (new SaleDetail())
        ->setCodProducto($i['codigo'])
        ->setUnidad($i['unidad'])
        ->setCantidad($i['cantidad'])
        ->setDescripcion($i['descripcion'])
        ->setMtoValorUnitario($i['valor_unitario'])
        ->setMtoBaseIgv($baseIgv)
        ->setPorcentajeIgv(IGV_PERCENT)
        ->setIgv($igvMonto)
        ->setTipAfeIgv('10')
        ->setTotalImpuestos($igvMonto)
        ->setMtoValorVenta($baseIgv)
        ->setMtoPrecioUnitario($i['valor_unitario'] * (1 + IGV_PERCENT / 100));

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

$result = $see->send($invoice);


file_put_contents($invoice->getName().'.xml', $see->getFactory()->getLastXml());

if (!$result->isSuccess()) {
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => $result->getError()->getCode(),
            'message' => $result->getError()->getMessage()
        ]
    ]);
    exit();
}

file_put_contents('R-'.$invoice->getName().'.zip', $result->getCdrZip());

$cdr = $result->getCdrResponse();
$code = (int)$cdr->getCode();

$response = [
    'success' => true,
    'cdr_code' => $code,
    'cdr_description' => $cdr->getDescription(),
    'status' => $code === 0 ? 'ACEPTADA' : ($code >= 2000 ? 'RECHAZADA' : 'OBSERVAR'),
    'notes' => $cdr->getNotes()
];

echo json_encode($response);

function num2letras($num) {
    return number_format($num, 2, '.', '');
}
