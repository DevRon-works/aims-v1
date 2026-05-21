<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_type');
            $table->string('merchant_name')->nullable();
            $table->string('store_location_name')->nullable();
            $table->text('store_address')->nullable();
            $table->string('store_manager')->nullable();
            $table->string('store_email')->nullable();
            $table->string('store_contact_number')->nullable();
            $table->string('bank')->nullable();
            $table->string('account_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('company')->nullable();
            $table->string('branch')->nullable();
            $table->string('pldt_status')->nullable();
            $table->text('remarks')->nullable();
            $table->string('check')->nullable();
            $table->string('company_account')->nullable();
            $table->string('department')->nullable();
            $table->string('email')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->string('link', 2048)->nullable();
            $table->string('status')->default('Active');
            $table->text('notes')->nullable();
            $table->string('updated_by')->nullable();
            $table->boolean('duplicate_account_number')->default(false);
            $table->boolean('invalid_url')->default(false);
            $table->boolean('missing_link')->default(false);
            $table->json('missing_fields')->nullable();
            $table->json('logs')->nullable();
            $table->timestamps();

            $table->index('account_type');
            $table->index('account_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
