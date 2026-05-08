<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();

        $stats = [
            'totalPatients' => Patient::count(),
            'todayAppointments' => Appointment::whereDate('appointment_date', $today)
                ->where('status', '!=', 'cancelled')
                ->count(),
            'pendingAppointments' => Appointment::where('status', 'pending')->count(),
            'monthlyRevenue' => Invoice::whereMonth('invoice_date', $today->month)
                ->whereYear('invoice_date', $today->year)
                ->sum('total_amount'),
        ];

        return response()->json($stats);
    }
}
