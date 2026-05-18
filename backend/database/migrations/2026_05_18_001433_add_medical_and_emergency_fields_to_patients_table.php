<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'gender')) {
                $table->string('gender', 20)->nullable()->after('birth_date');
            }
            if (!Schema::hasColumn('patients', 'blood_group')) {
                $table->string('blood_group', 10)->nullable()->after('gender');
            }
            if (!Schema::hasColumn('patients', 'allergies')) {
                $table->text('allergies')->nullable()->after('blood_group');
            }
            if (!Schema::hasColumn('patients', 'medical_history')) {
                $table->text('medical_history')->nullable()->after('allergies');
            }
            if (!Schema::hasColumn('patients', 'chronic_diseases')) {
                $table->text('chronic_diseases')->nullable()->after('medical_history');
            }
            if (!Schema::hasColumn('patients', 'current_medications')) {
                $table->text('current_medications')->nullable()->after('chronic_diseases');
            }
            if (!Schema::hasColumn('patients', 'emergency_contact_name')) {
                $table->string('emergency_contact_name', 100)->nullable()->after('current_medications');
            }
            if (!Schema::hasColumn('patients', 'emergency_contact_relation')) {
                $table->string('emergency_contact_relation', 50)->nullable()->after('emergency_contact_name');
            }
            if (!Schema::hasColumn('patients', 'emergency_contact_phone')) {
                $table->string('emergency_contact_phone', 25)->nullable()->after('emergency_contact_relation');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'gender',
                'blood_group',
                'allergies',
                'medical_history',
                'chronic_diseases',
                'current_medications',
                'emergency_contact_name',
                'emergency_contact_relation',
                'emergency_contact_phone',
            ]);
        });
    }
};
