<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('http://localhost:5173');
});

// Patient Portal Routes (Public)
Route::get('/patient/register', [\App\Http\Controllers\PatientPortalController::class, 'showRegistrationForm'])->name('patient.register');
Route::post('/patient/register', [\App\Http\Controllers\PatientPortalController::class, 'register']);

// Patient Dashboard Routes (Protected)
Route::middleware(['auth', 'role:patient'])->prefix('patient')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\PatientPortalController::class, 'dashboard'])->name('patient.dashboard');
    Route::get('/book', [\App\Http\Controllers\PatientPortalController::class, 'showBookingForm'])->name('patient.book');
    Route::post('/book', [\App\Http\Controllers\PatientPortalController::class, 'bookAppointment']);
    Route::patch('/appointments/{appointment}/cancel', [\App\Http\Controllers\PatientPortalController::class, 'cancelAppointment'])->name('patient.appointment.cancel');
});

Route::get('/dashboard', function () {
    return redirect('/app');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'role:admin|dentiste|assistant'])->prefix('admin')->group(function () {
    Route::get('/dashboard', \App\Http\Controllers\DashboardController::class)->name('admin.dashboard');
    
    Route::resource('patients', \App\Http\Controllers\PatientController::class);
    Route::resource('appointments', \App\Http\Controllers\AppointmentController::class);
    Route::post('appointments/{appointment}/treatments', [\App\Http\Controllers\AppointmentController::class, 'addTreatment'])->name('appointments.add-treatment');
    Route::post('appointments/{appointment}/reminder', [\App\Http\Controllers\AppointmentController::class, 'sendReminder'])->name('appointments.reminder');
    
    Route::resource('prescriptions', \App\Http\Controllers\PrescriptionController::class);
    Route::get('prescriptions/{prescription}/print', [\App\Http\Controllers\PrescriptionController::class, 'print'])->name('prescriptions.print');

    Route::resource('treatments', \App\Http\Controllers\TreatmentController::class);
    Route::resource('materials', \App\Http\Controllers\MaterialController::class);

    Route::resource('invoices', \App\Http\Controllers\InvoiceController::class);
    Route::post('invoices/{invoice}/payments', [\App\Http\Controllers\InvoiceController::class, 'addPayment'])->name('invoices.add-payment');
    Route::get('invoices/{invoice}/payments/history', [\App\Http\Controllers\PaymentController::class, 'history'])->name('payments.history');
    Route::get('invoices/{invoice}/pdf', [\App\Http\Controllers\InvoiceController::class, 'downloadPdf'])->name('invoices.pdf');
    Route::post('invoices/{invoice}/send', [\App\Http\Controllers\InvoiceController::class, 'sendEmail'])->name('invoices.send');

    Route::resource('payments', \App\Http\Controllers\PaymentController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/design-system', function () {
    return view('demo-design-system');
})->middleware(['auth', 'role:admin']);

// React SPA Route - redirect to frontend
Route::get('/app', function () {
    return redirect('http://localhost:5173');
})->middleware(['auth'])->name('app');

Route::get('/app/{any}', function () {
    return redirect('http://localhost:5173/' . request()->path());
})->middleware(['auth'])->where('any', '.*');

require __DIR__.'/auth.php';
