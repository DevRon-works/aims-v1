<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boutique_cctvs', function (Blueprint $table) {
            $table->id();
            $table->string('branch')->nullable();
            $table->string('brand')->nullable();
            $table->string('working_cameras')->nullable();
            $table->string('serial')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('web_ip')->nullable();
            $table->string('storage')->nullable();
            $table->string('status')->default('Online');
            $table->text('notes')->nullable();
            $table->string('updated_by')->nullable();
            $table->json('logs')->nullable();
            $table->timestamps();

            $table->index('branch');
            $table->index('serial');
            $table->index('web_ip');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boutique_cctvs');
    }
};
