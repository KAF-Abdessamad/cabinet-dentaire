<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Facture #{{ str_pad($invoice->id, 5, '0', STR_PAD_LEFT) }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; line-height: 1.5; color: #333; }
        .container { width: 100%; max-width: 800px; margin: 0 auto; padding: 30px; }
        
        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #10b981; }
        .logo-section { flex: 1; }
        .logo { font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 5px; }
        .company-name { font-size: 18px; font-weight: bold; color: #374151; }
        .company-info { font-size: 10px; color: #6b7280; margin-top: 5px; line-height: 1.4; }
        
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 28px; color: #10b981; margin-bottom: 5px; }
        .invoice-number { font-size: 14px; color: #6b7280; }
        
        /* Info Grid */
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-box { flex: 1; padding: 15px; background: #f9fafb; border-radius: 5px; margin: 0 10px; }
        .info-box:first-child { margin-left: 0; }
        .info-box:last-child { margin-right: 0; }
        .info-box h3 { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        .info-box p { margin: 3px 0; font-size: 11px; }
        .info-box .value { font-weight: bold; color: #374151; font-size: 12px; }
        
        /* Table */
        .table-section { margin: 30px 0; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #10b981; color: white; padding: 10px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
        tr:nth-child(even) { background: #f9fafb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        /* Totals */
        .totals { margin-top: 20px; width: 100%; }
        .totals-table { width: 300px; margin-left: auto; }
        .totals-table td { padding: 8px 10px; border: none; font-size: 11px; }
        .totals-table .label { text-align: right; color: #6b7280; }
        .totals-table .value { text-align: right; font-weight: bold; }
        .totals-table .total-row { background: #f0fdf4; font-size: 14px; }
        .totals-table .total-row td { padding: 12px 10px; border-top: 2px solid #10b981; }
        .totals-table .total-row .value { color: #059669; font-size: 16px; }
        
        /* Status */
        .status-box { display: inline-block; padding: 8px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fee2e2; color: #991b1b; }
        .status-partial { background: #fef3c7; color: #92400e; }
        
        /* Footer */
        .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 9px; color: #6b7280; text-align: center; }
        .footer p { margin: 3px 0; }
        
        /* Payments */
        .payments-section { margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 5px; }
        .payments-section h3 { font-size: 12px; color: #374151; margin-bottom: 10px; }
        .payment-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 10px; border-bottom: 1px dashed #d1d5db; }
        
        /* Notes */
        .notes { margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 5px 5px 0; }
        .notes h4 { font-size: 11px; color: #92400e; margin-bottom: 5px; }
        .notes p { font-size: 10px; color: #78350f; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo-section">
                <div class="logo">🦷 DentistPro</div>
                <div class="company-name">Cabinet Dentaire</div>
                <div class="company-info">
                    123 Rue de la Santé<br>
                    75001 Paris, France<br>
                    Tél : 01 23 45 67 89<br>
                    Email : contact@cabinet.com<br>
                    SIRET : 123 456 789 00010
                </div>
            </div>
            <div class="invoice-title">
                <h1>FACTURE</h1>
                <div class="invoice-number">N° {{ str_pad($invoice->id, 5, '0', STR_PAD_LEFT) }}</div>
                @php
                    $remaining = $invoice->remaining_amount;
                    $isPaid = $remaining <= 0;
                    $isPartial = $remaining < $invoice->total_amount && $remaining > 0;
                @endphp
                <div style="margin-top: 10px;">
                    <span class="status-box {{ $isPaid ? 'status-paid' : ($isPartial ? 'status-partial' : 'status-pending') }}">
                        {{ $isPaid ? 'PAYÉE' : ($isPartial ? 'PARTIELLE' : 'IMPAYÉE') }}
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Info Grid -->
        <div class="info-grid">
            <div class="info-box">
                <h3>Patient</h3>
                <p class="value">{{ $invoice->patient->full_name }}</p>
                <p>{{ $invoice->patient->address ?? 'Adresse non renseignée' }}</p>
                <p>Tél : {{ $invoice->patient->phone }}</p>
                <p>Email : {{ $invoice->patient->email }}</p>
                @if($invoice->patient->cin)
                <p>CIN : {{ $invoice->patient->cin }}</p>
                @endif
            </div>
            
            <div class="info-box">
                <h3>Informations Facture</h3>
                <p>Date d'émission : <span class="value">{{ $invoice->invoice_date->format('d/m/Y') }}</span></p>
                <p>Date d'échéance : <span class="value">{{ $invoice->invoice_date->addDays(30)->format('d/m/Y') }}</span></p>
                @if($invoice->appointment)
                <p>Rendez-vous du : {{ $invoice->appointment->appointment_date->format('d/m/Y') }}</p>
                @endif
            </div>
            
            <div class="info-box">
                <h3>Paiement</h3>
                <p>Mode de règlement : <span class="value">Carte bancaire, Espèces, Chèque</span></p>
                <p>Total TTC : <span class="value">{{ number_format($invoice->total_amount, 2, ',', ' ') }} DH</span></p>
                @if($invoice->payments->sum('amount') > 0)
                <p>Payé : <span class="value" style="color: #059669;">{{ number_format($invoice->payments->sum('amount'), 2, ',', ' ') }} DH</span></p>
                @endif
                @if($remaining > 0)
                <p>Reste à payer : <span class="value" style="color: #dc2626;">{{ number_format($remaining, 2, ',', ' ') }} DH</span></p>
                @endif
            </div>
        </div>
        
        <!-- Services Table -->
        <div class="table-section">
            <table>
                <thead>
                    <tr>
                        <th style="width: 50%;">Description</th>
                        <th class="text-center">Quantité</th>
                        <th class="text-right">Prix unitaire</th>
                        <th class="text-right">Montant</th>
                    </tr>
                </thead>
                <tbody>
                    @if($invoice->appointment && $invoice->appointment->treatments)
                        @foreach($invoice->appointment->treatments as $treatment)
                        <tr>
                            <td>
                                <strong>{{ $treatment->name }}</strong><br>
                                <span style="font-size: 9px; color: #6b7280;">{{ $treatment->description }}</span>
                            </td>
                            <td class="text-center">{{ $treatment->pivot->quantity ?? 1 }}</td>
                            <td class="text-right">{{ number_format($treatment->pivot->applied_price ?? $treatment->price, 2, ',', ' ') }} €</td>
                            <td class="text-right">{{ number_format(($treatment->pivot->applied_price ?? $treatment->price) * ($treatment->pivot->quantity ?? 1), 2, ',', ' ') }} €</td>
                        </tr>
                        @endforeach
                    @else
                        <tr>
                            <td colspan="4" class="text-center">Consultation et soins dentaires</td>
                        </tr>
                    @endif
                </tbody>
            </table>
        </div>
        
        <!-- Totals -->
        <div class="totals">
            <table class="totals-table">
                <tr>
                    <td class="label">Total HT :</td>
                    <td class="value">{{ number_format($invoice->total_amount / 1.2, 2, ',', ' ') }} €</td>
                </tr>
                <tr>
                    <td class="label">TVA (20%) :</td>
                    <td class="value">{{ number_format($invoice->total_amount - ($invoice->total_amount / 1.2), 2, ',', ' ') }} €</td>
                </tr>
                <tr class="total-row">
                    <td class="label">TOTAL TTC :</td>
                    <td class="value">{{ number_format($invoice->total_amount, 2, ',', ' ') }} €</td>
                </tr>
            </table>
        </div>
        
        <!-- Payments History -->
        @if($invoice->payments->count() > 0)
        <div class="payments-section">
            <h3>Historique des paiements</h3>
            @foreach($invoice->payments as $payment)
            <div class="payment-row">
                <span>Paiement du {{ $payment->payment_date->format('d/m/Y') }} - {{ ucfirst($payment->payment_method) }}</span>
                <span style="font-weight: bold;">{{ number_format($payment->amount, 2, ',', ' ') }} €</span>
            </div>
            @endforeach
        </div>
        @endif
        
        <!-- Notes -->
        <div class="notes">
            <h4>📋 Informations importantes</h4>
            <p>Cette facture est payable à réception. En cas de retard de paiement, des pénalités de retard pourront être appliquées conformément à la législation en vigueur. Les règlements peuvent être effectués par carte bancaire, espèces ou chèque au cabinet, ou par virement bancaire.</p>
            <p style="margin-top: 5px;">N° SIRET : 123 456 789 00010 - Code NAF : 8623Z - N° TVA Intracommunautaire : FR 12 345678900</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Cabinet Dentaire DentistPro</strong> - Votre sourire, notre priorité</p>
            <p>En cas de questions concernant cette facture, merci de nous contacter au 01 23 45 67 89</p>
            <p style="margin-top: 10px;">Document généré le {{ now()->format('d/m/Y à H:i') }} | Page 1/1</p>
        </div>
    </div>
</body>
</html>
