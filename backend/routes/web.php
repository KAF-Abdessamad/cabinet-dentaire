<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/', function () {
    $indexPath = public_path('index.html');

    if (File::exists($indexPath)) {
        return response()->file($indexPath);
    }

    return response()->make(
        '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Patient SPA manquant</title></head><body style="font-family:system-ui,Segoe UI,Roboto,Arial;max-width:760px;margin:40px auto;padding:0 16px;line-height:1.5"><h1>Build React manquant</h1><p>Le fichier <code>public/index.html</code> n\'existe pas encore. Lance la compilation du frontend.</p><pre style="background:#f6f8fa;padding:12px;border-radius:8px;overflow:auto">cd frontend\nnpm run build</pre><p>Puis recharge cette page.</p></body></html>',
        500,
        ['Content-Type' => 'text/html; charset=UTF-8']
    );
});

// NOTE: Patient portal Blade routes are intentionally removed in Option B (React = patient).

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

require __DIR__.'/auth.php';

// Catch-all for patient SPA (must come last, excludes admin + api + sanctum)
Route::get('/{any}', function () {
    $indexPath = public_path('index.html');

    if (File::exists($indexPath)) {
        return response()->file($indexPath);
    }

    return abort(404);
})->where('any', '^(?!admin($|/)|api($|/)|sanctum($|/)).*');
