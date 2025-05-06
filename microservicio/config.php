<?php

use Greenter\Ws\Services\SunatEndpoints;
use Greenter\See;

require __DIR__.'/vendor/autoload.php';

$see = new See();
$see->setCertificate(file_get_contents(__DIR__.'/LLAMAPECERTIFICADODEMO20452578957_cert_out.pem'));
$see->setClavePrivada('pruebaBoletas');
$see->setClaveSOL('20452578957', 'MODDATOS', 'moddatos');
$see->setService(SunatEndpoints::FE_BETA);

return $see;
