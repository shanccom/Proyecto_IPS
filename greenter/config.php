<?php
use Greenter\Ws\Services\SunatEndpoints;
use Greenter\See;

$see = new See();
$see->setCertificate(file_get_contents(__DIR__.'/certificado.pem'));
$see->setService(SunatEndpoints::FE_BETA);
$see->setCredentials('20000000001', 'MODDATOS', 'moddatos'); 

return $see;