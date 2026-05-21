<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cctv_import_histories', function (Blueprint $table) {
            $table->unsignedInteger('skipped_duplicate_rows')->default(0)->after('imported_rows');
            $table->unsignedInteger('updated_rows')->default(0)->after('skipped_duplicate_rows');
        });
    }

    public function down(): void
    {
        Schema::table('cctv_import_histories', function (Blueprint $table) {
            $table->dropColumn(['skipped_duplicate_rows', 'updated_rows']);
        });
    }
};
