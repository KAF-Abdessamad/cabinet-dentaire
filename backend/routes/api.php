<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientRegistrationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PatientDashboardController;
use App\Http\Controllers\Api\PatientApiController;
use App\Http\Controllers\Api\AppointmentApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public API routes (no auth required)
Route::post('/login', [AuthController::class, 'store'])->middleware(['web', 'guest']);
Route::post('/admin/login', [AuthController::class, 'storeAdmin'])->middleware('force.json')->withoutMiddleware([
    \Illuminate\Auth\Middleware\Authenticate::class,
    \Illuminate\Auth\Middleware\RedirectIfAuthenticated::class,
]);
Route::post('/register', [PatientRegistrationController::class, 'store'])->middleware(['web', 'guest']);

Route::middleware(['auth:sanctum'])->group(function () {
    // Current authenticated user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Patient-specific routes (for patient role)
    Route::middleware('role:patient')->group(function () {
        Route::get('/patient/stats', [PatientDashboardController::class, 'stats']);
        Route::get('/patient/appointments', [PatientDashboardController::class, 'appointments']);
        Route::get('/patient/medical-records', [PatientDashboardController::class, 'medicalRecords']);
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

        // Appointments API
        Route::get('/appointments', [AppointmentApiController::class, 'index']);
        Route::get('/appointments/{appointment}', [AppointmentApiController::class, 'show']);
        Route::post('/appointments', [AppointmentApiController::class, 'store']);
        Route::put('/appointments/{appointment}', [AppointmentApiController::class, 'update']);
        Route::delete('/appointments/{appointment}', [AppointmentApiController::class, 'destroy']);
    });
});
