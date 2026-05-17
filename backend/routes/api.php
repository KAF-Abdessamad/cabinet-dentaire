<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientRegistrationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PatientDashboardController;
use App\Http\Controllers\Api\PatientApiController;
use App\Http\Controllers\Api\AppointmentApiController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ContactController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public API routes (no auth required)
Route::post('/login', [AuthController::class, 'store'])->middleware(['web', 'force.json']);
Route::post('/admin/login', [AuthController::class, 'storeAdmin'])->middleware(['web', 'force.json']);
Route::post('/register', [PatientRegistrationController::class, 'store'])->middleware(['web', 'force.json']);
Route::post('/contact', [ContactController::class, 'store'])->middleware(['web', 'force.json']);

Route::middleware(['auth:sanctum', 'web', 'force.json'])->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Current authenticated user (rôle inclus pour la SPA patient)
    Route::get('/user', function (Request $request) {
        $user = $request->user()->loadMissing('roles');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->roles->first()?->name,
        ];
    });

    // Patient-specific routes (for patient role)
    Route::middleware('role:patient')->group(function () {
        Route::get('/patient/stats', [PatientDashboardController::class, 'stats']);
        Route::get('/patient/appointments', [PatientDashboardController::class, 'appointments']);
        Route::get('/patient/medical-records', [PatientDashboardController::class, 'medicalRecords']);
        Route::get('/patient/dentists', [PatientDashboardController::class, 'dentists']);
        Route::get('/patient/invoices', [PatientDashboardController::class, 'invoices']);
        Route::get('/patient/treatments', [PatientDashboardController::class, 'treatments']);
        Route::post('/patient/appointments', [PatientDashboardController::class, 'storeAppointment']);
        Route::post('/patient/appointments/{appointment}/confirm', [PatientDashboardController::class, 'confirmAppointment']);
        Route::post('/patient/appointments/{appointment}/reject', [PatientDashboardController::class, 'rejectAppointment']);
        Route::post('/patient/appointments/{appointment}/cancel', [PatientDashboardController::class, 'cancelAppointment']);
    });

    // Admin/Dentist routes
    Route::middleware('role:admin|dentiste')->group(function () {
        // Dashboard API
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // Patients API
        Route::get('/patients', [PatientApiController::class, 'index']);
        Route::get('/patients/{patient}', [PatientApiController::class, 'show']);
        Route::post('/patients', [PatientApiController::class, 'store']);
        Route::put('/patients/{patient}', [PatientApiController::class, 'update']);
        Route::delete('/patients/{patient}', [PatientApiController::class, 'destroy']);

        // Référentiels RDV (même logique que l’espace patient, autorisé pour le cabinet)
        Route::get('/cabinet/dentists', [PatientDashboardController::class, 'dentists']);
        Route::get('/cabinet/treatments', [PatientDashboardController::class, 'treatments']);

        // Appointments API
        Route::get('/check-availability', [AppointmentApiController::class, 'checkAvailability']);
        Route::get('/appointments', [AppointmentApiController::class, 'index']);
        Route::get('/appointments/{appointment}', [AppointmentApiController::class, 'show']);
        Route::post('/appointments', [AppointmentApiController::class, 'store']);
        Route::put('/appointments/{appointment}', [AppointmentApiController::class, 'update']);
        Route::delete('/appointments/{appointment}', [AppointmentApiController::class, 'destroy']);
    });
});
