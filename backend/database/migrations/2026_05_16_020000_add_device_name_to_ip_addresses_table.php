<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ip_addresses', function (Blueprint $table) {
            $table->string('device_name')->nullable()->after('device_type');
        });

        DB::table('ip_addresses')
            ->whereNull('device_name')
            ->update(['device_name' => DB::raw('computer_name')]);
    }

    public function down(): void
    {
        Schema::table('ip_addresses', function (Blueprint $table) {
            $table->dropColumn('device_name');
        });
    }
};
