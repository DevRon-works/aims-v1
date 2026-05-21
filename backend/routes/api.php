<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvadaCenterCctvController;
use App\Http\Controllers\BoutiqueCctvController;
use App\Http\Controllers\CctvImportController;
use App\Http\Controllers\DynamicTableColumnController;
use App\Http\Controllers\DynamicTableValueController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\ImportStatusController;
use App\Http\Controllers\IpAddressController;
use App\Http\Controllers\ModuleRecordController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseOnlineCctvController;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::apiResource('accounts', AccountController::class);

    Route::get('/emails/export', [EmailController::class, 'export']);
    Route::get('/emails/options', [EmailController::class, 'options']);
    Route::post('/emails/import', [EmailController::class, 'import']);
    Route::apiResource('emails', EmailController::class);

    Route::get('/import-status', [ImportStatusController::class, 'index']);
    Route::get('/import-status/{module}', [ImportStatusController::class, 'show']);
    Route::post('/import-status/reset', [ImportStatusController::class, 'reset']);

    Route::get('/ip-addresses', [IpAddressController::class, 'index']);
    Route::post('/ip-addresses', [IpAddressController::class, 'store']);
    Route::put('/ip-addresses/{ipAddress}', [IpAddressController::class, 'update']);
    Route::delete('/ip-addresses/{ipAddress}', [IpAddressController::class, 'destroy']);
    Route::post('/ip-addresses/{ipAddress}/test-connection', [IpAddressController::class, 'testConnection']);

    Route::get('/wifi-data', [ModuleRecordController::class, 'index']);
    Route::get('/remote-desktops', [ModuleRecordController::class, 'index']);
    Route::get('/pos-hookups', [ModuleRecordController::class, 'index']);
    Route::get('/social-media-accounts', [ModuleRecordController::class, 'index']);
    Route::get('/modules/{module}', [ModuleRecordController::class, 'index']);
    Route::get('/users', [UserController::class, 'index']);

    Route::get('/table-schemas/{module}/columns', [DynamicTableColumnController::class, 'index']);
    Route::post('/table-schemas/{module}/columns', [DynamicTableColumnController::class, 'store']);
    Route::put('/table-schemas/{module}/columns/{column}', [DynamicTableColumnController::class, 'update']);
    Route::delete('/table-schemas/{module}/columns/{column}', [DynamicTableColumnController::class, 'destroy']);
    Route::patch('/table-schemas/{module}/records/{record}/values', [DynamicTableValueController::class, 'update']);

    Route::post('/cctv/import', CctvImportController::class);

    Route::get('/cctv/avada-center', [AvadaCenterCctvController::class, 'index']);
    Route::post('/cctv/avada-center', [AvadaCenterCctvController::class, 'store']);
    Route::get('/cctv/avada-center/export', [AvadaCenterCctvController::class, 'export']);
    Route::get('/cctv/avada-center/{avadaCenterCctv}', [AvadaCenterCctvController::class, 'show']);
    Route::put('/cctv/avada-center/{avadaCenterCctv}', [AvadaCenterCctvController::class, 'update']);
    Route::delete('/cctv/avada-center/{avadaCenterCctv}', [AvadaCenterCctvController::class, 'destroy']);

    Route::get('/cctv/boutique', [BoutiqueCctvController::class, 'index']);
    Route::post('/cctv/boutique', [BoutiqueCctvController::class, 'store']);
    Route::get('/cctv/boutique/export', [BoutiqueCctvController::class, 'export']);
    Route::get('/cctv/boutique/{boutiqueCctv}', [BoutiqueCctvController::class, 'show']);
    Route::put('/cctv/boutique/{boutiqueCctv}', [BoutiqueCctvController::class, 'update']);
    Route::delete('/cctv/boutique/{boutiqueCctv}', [BoutiqueCctvController::class, 'destroy']);

    Route::get('/cctv/warehouse-online', [WarehouseOnlineCctvController::class, 'index']);
    Route::post('/cctv/warehouse-online', [WarehouseOnlineCctvController::class, 'store']);
    Route::get('/cctv/warehouse-online/export', [WarehouseOnlineCctvController::class, 'export']);
    Route::get('/cctv/warehouse-online/{warehouseOnlineCctv}', [WarehouseOnlineCctvController::class, 'show']);
    Route::put('/cctv/warehouse-online/{warehouseOnlineCctv}', [WarehouseOnlineCctvController::class, 'update']);
    Route::delete('/cctv/warehouse-online/{warehouseOnlineCctv}', [WarehouseOnlineCctvController::class, 'destroy']);
});
