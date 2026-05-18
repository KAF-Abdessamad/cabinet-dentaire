<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $today = Carbon::today();

        $stats = Cache::remember('admin_dashboard_stats', 300, function () use ($today) {
            return [
                'totalPatients' => Patient::count(),
                'todayAppointments' => Appointment::whereDate('appointment_date', $today)
                    ->where('status', '!=', 'cancelled')
                    ->count(),
                'pendingAppointments' => Appointment::whereIn('status', ['pending', 'requested', 'proposed'])->count(),
                'monthlyRevenue' => Invoice::whereMonth('invoice_date', $today->month)
                    ->whereYear('invoice_date', $today->year)
                    ->sum('total_amount'),
                'unpaidInvoices' => Invoice::where('status', '!=', 'paid')->count(),
            ];
        });

        return response()->json($stats);
    }
}
