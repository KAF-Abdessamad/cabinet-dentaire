<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->index('email');
            $table->index('cin');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->index('start_time');
            $table->index('dentist_id');
            $table->index('patient_id');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropIndex(['cin']);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['start_time']);
            $table->dropIndex(['dentist_id']);
            $table->dropIndex(['patient_id']);
        });
    }
};
