<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Treatment;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\Gate;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __invoke(): View
    {
        Gate::authorize('viewAny', Patient::class);

        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();
        $weekStart = Carbon::now()->startOfWeek();
        
        $stats = [
            'total_patients' => Patient::count(),
            'new_patients_month' => Patient::whereMonth('created_at', Carbon::now()->month)->count(),
            'appointments_today' => Appointment::whereDate('appointment_date', $today)->count(),
            'appointments_week' => Appointment::whereBetween('appointment_date', [$weekStart, Carbon::now()->endOfWeek()])->count(),
            'pending_appointments' => Appointment::where('status', 'pending')->count(),
            'completed_appointments_month' => Appointment::where('status', 'completed')->whereMonth('appointment_date', Carbon::now()->month)->count(),
            'revenue_month' => Payment::whereMonth('payment_date', Carbon::now()->month)->sum('amount'),
            'revenue_today' => Payment::whereDate('payment_date', $today)->sum('amount'),
            'pending_invoices_count' => Invoice::whereIn('status', ['pending', 'partial'])->count(),
            'pending_invoices_amount' => Invoice::whereIn('status', ['pending', 'partial'])->sum('total_amount') - Payment::sum('amount'),
        ];

        $todaysAppointments = Appointment::with(['patient', 'dentist', 'treatments'])
            ->whereDate('appointment_date', $today)
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time')
            ->get();

        $upcomingAppointments = Appointment::with(['patient', 'dentist'])
            ->whereDate('appointment_date', '>', $today)
            ->where('status', '!=', 'cancelled')
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->limit(5)
            ->get();

        $recentPatients = Patient::orderBy('created_at', 'desc')->limit(5)->get();

        $recentPayments = Payment::with(['invoice.patient'])
            ->orderBy('payment_date', 'desc')
            ->limit(5)
            ->get();

        $recentActivity = $this->getRecentActivity();

        $revenueChart = $this->getRevenueChartData();

        return view('dashboard', compact(
            'stats', 
            'todaysAppointments', 
            'upcomingAppointments', 
            'recentPatients', 
            'recentPayments',
            'recentActivity',
            'revenueChart'
        ));
    }

    private function getRecentActivity(): array
    {
        $activity = [];

        $recentAppointments = Appointment::with(['patient', 'dentist'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentAppointments as $appointment) {
            $activity[] = [
                'type' => 'appointment',
                'icon' => 'calendar',
                'color' => 'blue',
                'message' => "Rendez-vous créé pour {$appointment->patient->full_name}",
                'time' => $appointment->created_at,
                'link' => route('appointments.index'),
            ];
        }

        $recentPayments = Payment::with(['invoice.patient'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentPayments as $payment) {
            $activity[] = [
                'type' => 'payment',
                'icon' => 'money',
                'color' => 'green',
                'message' => "Paiement de " . number_format($payment->amount, 2, ',', ' ') . " € reçu de {$payment->invoice->patient->full_name}",
                'time' => $payment->created_at,
                'link' => route('payments.show', $payment),
            ];
        }

        $recentPatients = Patient::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentPatients as $patient) {
            $activity[] = [
                'type' => 'patient',
                'icon' => 'user',
                'color' => 'purple',
                'message' => "Nouveau patient: {$patient->full_name}",
                'time' => $patient->created_at,
                'link' => route('patients.show', $patient),
            ];
        }

        usort($activity, fn($a, $b) => $b['time'] <=> $a['time']);

        return array_slice($activity, 0, 10);
    }

    private function getRevenueChartData(): array
    {
        $data = [];
        $labels = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $labels[] = $month->translatedFormat('M Y');
            $data[] = Payment::whereMonth('payment_date', $month->month)
                ->whereYear('payment_date', $month->year)
                ->sum('amount');
        }

        return ['labels' => $labels, 'data' => $data];
    }
}
