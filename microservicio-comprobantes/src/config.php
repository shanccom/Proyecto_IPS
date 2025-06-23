<?php

// Configuración de la empresa emisora
define('COMPANY_RUC', '20000000001');
define('COMPANY_RAZON_SOCIAL', 'Mi Empresa SAC');
define('COMPANY_NOMBRE_COMERCIAL', 'Mi Empresa');
define('COMPANY_UBIGEO', '150101');
define('COMPANY_DEPARTAMENTO', 'LIMA');
define('COMPANY_PROVINCIA', 'LIMA');
define('COMPANY_DISTRITO', 'LIMA');
define('COMPANY_DIRECCION', 'Av. Lima 123');

// Configuración SUNAT
define('SUNAT_RUC', '20000000001');
define('SUNAT_USUARIO', 'MODDATOS');
define('SUNAT_CLAVE', 'moddatos');
define('SUNAT_ENDPOINT', \Greenter\Ws\Services\SunatEndpoints::FE_BETA);

// Rutas de almacenamiento
define('STORAGE_PATH', __DIR__ . '/../storage');
define('XML_PATH', STORAGE_PATH . '/xml');
define('CDR_PATH', STORAGE_PATH . '/cdr');
define('LOGS_PATH', STORAGE_PATH . '/logs');
define('CERT_PATH', __DIR__ . '/../certificado.pem');

