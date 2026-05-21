<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('emails')) {
            return;
        }

        if (! $this->hasEmailAccountUniqueIndex()) {
            return;
        }

        Schema::table('emails', function ($table) {
            $table->dropUnique('emails_email_account_unique');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('emails')) {
            return;
        }

        Schema::table('emails', function ($table) {
            $table->unique('email_account');
        });
    }

    private function hasEmailAccountUniqueIndex(): bool
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            return false;
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            return DB::select("SHOW INDEX FROM emails WHERE Key_name = 'emails_email_account_unique'") !== [];
        }

        if ($driver === 'pgsql') {
            return DB::select(
                "SELECT 1 FROM pg_indexes WHERE tablename = 'emails' AND indexname = 'emails_email_account_unique'",
            ) !== [];
        }

        if ($driver === 'sqlsrv') {
            return DB::select(
                "SELECT 1 FROM sys.indexes WHERE name = 'emails_email_account_unique' AND object_id = OBJECT_ID('emails')",
            ) !== [];
        }

        return true;
    }
};
