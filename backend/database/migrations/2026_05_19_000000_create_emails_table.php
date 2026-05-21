<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emails', function (Blueprint $table) {
            $table->id();
            $table->string('emails_type');
            $table->string('email_account');
            $table->text('password')->nullable();
            $table->string('department')->nullable();
            $table->string('person_used')->nullable();
            $table->text('purpose')->nullable();
            $table->string('recovery_email')->nullable();
            $table->text('recovery_number_verification')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();

            $table->index(['emails_type', 'department']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emails');
    }
};
