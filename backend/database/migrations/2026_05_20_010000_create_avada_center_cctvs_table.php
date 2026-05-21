<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avada_center_cctvs', function (Blueprint $table) {
            $table->id();
            $table->string('floor_name')->nullable();
            $table->string('camera_number')->nullable();
            $table->string('camera_name')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('nvr_ip')->nullable();
            $table->string('camera_ip')->nullable();
            $table->string('status')->default('Online');
            $table->text('notes')->nullable();
            $table->string('updated_by')->nullable();
            $table->json('logs')->nullable();
            $table->timestamps();

            $table->index('camera_number');
            $table->index('camera_ip');
            $table->index('nvr_ip');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avada_center_cctvs');
    }
};
