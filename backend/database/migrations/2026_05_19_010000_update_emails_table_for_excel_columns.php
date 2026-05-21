<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('emails')) {
            return;
        }

        Schema::create('emails_excel_columns', function (Blueprint $table) {
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

        DB::table('emails')->orderBy('id')->get()->each(function ($email) {
            DB::table('emails_excel_columns')->insert([
                'id' => $email->id,
                'emails_type' => $email->emails_type ?? $email->provider ?? 'EMAIL',
                'email_account' => $email->email_account ?? $email->email_address ?? '',
                'password' => $email->password ?? $email->password_note ?? null,
                'department' => $email->department ?? null,
                'person_used' => $email->person_used ?? $email->assigned_to ?? null,
                'purpose' => $email->purpose ?? $email->remarks ?? null,
                'recovery_email' => $email->recovery_email ?? null,
                'recovery_number_verification' => $email->recovery_number_verification ?? $email->recovery_phone ?? null,
                'updated_by' => $email->updated_by ?? null,
                'created_at' => $email->created_at ?? now(),
                'updated_at' => $email->updated_at ?? now(),
            ]);
        });

        Schema::drop('emails');
        Schema::rename('emails_excel_columns', 'emails');
    }

    public function down(): void
    {
        if (! Schema::hasTable('emails')) {
            return;
        }

        Schema::create('emails_legacy_columns', function (Blueprint $table) {
            $table->id();
            $table->string('account_name');
            $table->string('email_address')->unique();
            $table->string('provider')->nullable();
            $table->string('username')->nullable();
            $table->text('password_note')->nullable();
            $table->string('recovery_email')->nullable();
            $table->string('recovery_phone', 40)->nullable();
            $table->string('assigned_to')->nullable();
            $table->string('department')->nullable();
            $table->string('status')->default('Active');
            $table->text('remarks')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
        });

        DB::table('emails')->orderBy('id')->get()->each(function ($email) {
            DB::table('emails_legacy_columns')->insert([
                'id' => $email->id,
                'account_name' => $email->emails_type,
                'email_address' => $email->email_account,
                'provider' => $email->emails_type,
                'password_note' => $email->password,
                'recovery_email' => $email->recovery_email,
                'recovery_phone' => $email->recovery_number_verification,
                'assigned_to' => $email->person_used,
                'department' => $email->department,
                'status' => 'Active',
                'remarks' => $email->purpose,
                'updated_by' => $email->updated_by,
                'created_at' => $email->created_at,
                'updated_at' => $email->updated_at,
            ]);
        });

        Schema::drop('emails');
        Schema::rename('emails_legacy_columns', 'emails');
    }
};
