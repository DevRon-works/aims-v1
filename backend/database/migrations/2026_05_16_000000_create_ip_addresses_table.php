<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ip_addresses', function (Blueprint $table) {
            $table->id();
            $table->string('location')->nullable();
            $table->string('name')->nullable();
            $table->string('department')->nullable();
            $table->string('computer_name')->nullable();
            $table->string('mac_address')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('status')->default('Active');
            $table->text('notes')->nullable();
            $table->string('updated_by')->nullable();
            $table->boolean('duplicate_ip')->default(false);
            $table->boolean('duplicate_mac')->default(false);
            $table->json('missing_fields')->nullable();
            $table->json('logs')->nullable();
            $table->timestamps();

            $table->index('ip_address');
            $table->index('mac_address');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ip_addresses');
    }
};
