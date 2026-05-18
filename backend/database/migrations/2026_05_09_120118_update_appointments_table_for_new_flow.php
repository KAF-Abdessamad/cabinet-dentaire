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
            $table->date('appointment_date')->nullable()->change();
            $table->time('start_time')->nullable()->change();
            $table->foreignId('user_id')->nullable()->change();
            $table->foreignId('treatment_id')->nullable()->constrained()->onDelete('set null');
            $table->text('patient_note')->nullable();
            $table->text('admin_note')->nullable();
            // Modifying enum is tricky in MySQL, we might need a raw query or just accept new strings
        });
        
        // Use raw query to update enum if needed, or just rely on the application logic 
        // if the DB doesn't strictly enforce it. Laravel's enum can be flexible.
        // However, let's try to update it properly.
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('requested', 'proposed', 'confirmed', 'completed', 'cancelled') DEFAULT 'requested'");
        }
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->date('appointment_date')->nullable(false)->change();
            $table->time('start_time')->nullable(false)->change();
            $table->foreignId('user_id')->nullable(false)->change();
            $table->dropConstrainedForeignId('treatment_id');
            $table->dropColumn(['patient_note', 'admin_note']);
        });
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE appointments MODIFY COLUMN status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending'");
        }
    }
};
