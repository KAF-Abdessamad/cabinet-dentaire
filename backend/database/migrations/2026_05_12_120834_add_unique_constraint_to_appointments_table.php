<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dateTime('starts_at')->nullable()->after('user_id');
            $table->dateTime('ends_at')->nullable()->after('starts_at');
        });

        // Migrate existing data
        DB::table('appointments')->whereNotNull('appointment_date')->whereNotNull('start_time')->get()->each(function ($appointment) {
            $startsAt = $appointment->appointment_date . ' ' . $appointment->start_time;
            $endsAt = $appointment->appointment_date . ' ' . ($appointment->end_time ?? $appointment->start_time);
            
            DB::table('appointments')->where('id', $appointment->id)->update([
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
            ]);
        });

        Schema::table('appointments', function (Blueprint $table) {
            // Add unique constraint. 
            // Note: If there are existing duplicates, this might fail.
            // But we'll try to add it.
            $table->unique(['user_id', 'starts_at'], 'uidx_dentist_starts_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropUnique('uidx_dentist_starts_at');
            $table->dropColumn(['starts_at', 'ends_at']);
        });
    }
};
