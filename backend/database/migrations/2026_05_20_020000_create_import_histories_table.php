<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('import_histories', function (Blueprint $table) {
            $table->id();
            $table->string('module_name');
            $table->string('import_type')->default('default');
            $table->string('file_name')->nullable();
            $table->string('status')->default('processing');
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('imported_rows')->default(0);
            $table->unsignedInteger('failed_rows')->default(0);
            $table->string('imported_by')->nullable();
            $table->timestamp('imported_at')->nullable();
            $table->timestamps();

            $table->index(['module_name', 'import_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('import_histories');
    }
};
