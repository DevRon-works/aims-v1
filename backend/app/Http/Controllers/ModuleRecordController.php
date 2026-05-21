<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class ModuleRecordController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => []]);
    }
}
