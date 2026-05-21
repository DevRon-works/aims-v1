<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dynamic_table_columns', function (Blueprint $table) {
            $table->id();
            $table->string('module');
            $table->string('key');
            $table->string('label');
            $table->string('field_type', 32);
            $table->json('options')->nullable();
            $table->boolean('is_custom')->default(true);
            $table->boolean('is_protected')->default(false);
            $table->boolean('is_required')->default(false);
            $table->boolean('is_hidden')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['module', 'key']);
            $table->index(['module', 'sort_order']);
        });

        Schema::create('dynamic_table_values', function (Blueprint $table) {
            $table->id();
            $table->string('module');
            $table->string('record_id');
            $table->foreignId('dynamic_table_column_id')->constrained()->cascadeOnDelete();
            $table->json('value')->nullable();
            $table->timestamps();

            $table->unique(
                ['module', 'record_id', 'dynamic_table_column_id'],
                'dynamic_table_value_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dynamic_table_values');
        Schema::dropIfExists('dynamic_table_columns');
    }
};
