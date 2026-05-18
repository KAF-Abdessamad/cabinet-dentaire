<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Facture #{{ str_pad($invoice->id, 5, '0', STR_PAD_LEFT) }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; line-height: 1.4; color: #334155; }
        .container { width: 100%; padding: 40px; position: relative; }
        
        /* Watermark style */
        .watermark {
            position: absolute;
            top: 40%;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 90px;
            font-weight: 900;
            text-transform: uppercase;
            transform: rotate(-30deg);
            z-index: -1000;
            letter-spacing: 12px;
        }
        .watermark-paid {
            color: rgba(16, 185, 129, 0.08);
        }
        .watermark-unpaid {
            color: rgba(239, 68, 68, 0.08);
        }
        
        /* Header section */
        .header-table { width: 100%; border-bottom: 2px solid #e2e8f0; padding-bottom: 25px; margin-bottom: 30px; }
        .logo { font-size: 26px; font-weight: 800; color: #0284c7; font-family: 'Helvetica', sans-serif; }
        .company-info { font-size: 10px; color: #64748b; line-height: 1.5; margin-top: 5px; }
        .invoice-title-sec { text-align: right; }
        .invoice-title-sec h1 { font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 5px; letter-spacing: -0.5px; }
        .invoice-number { font-size: 13px; font-weight: 700; color: #64748b; }
        
        /* Status badge */
        .status-badge { display: inline-block; padding: 6px 14px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-top: 10px; }
        .status-paid { background-color: #d1fae5; color: #065f46; }
        .status-partial { background-color: #fef3c7; color: #92400e; }
        .status-pending { background-color: #fee2e2; color: #991b1b; }
        
        /* Info Grid Table */
        .info-table { width: 100%; margin-bottom: 35px; border-spacing: 15px 0; margin-left: -15px; margin-right: -15px; }
        .info-cell { width: 33.33%; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 15px; vertical-align: top; }
        .info-cell h3 { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 1px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        .info-cell p { margin: 3px 0; color: #334155; font-size: 10px; }
        .info-cell .bold-val { font-weight: 700; color: #0f172a; }
        
        /* Services table */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #0f172a; color: white; padding: 12px 14px; font-size: 9px; font-weight: 800; text-transform: uppercase; text-align: left; }
        .items-table td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #334155; }
        .items-table tr:nth-child(even) td { background: #f8fafc; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        /* Totals */
        .totals-sec { width: 100%; margin-top: 15px; }
        .totals-table { width: 260px; margin-left: auto; border-collapse: collapse; }
        .totals-table td { padding: 8px 10px; font-size: 10px; color: #475569; }
        .totals-table .total-row { background: #f0f9ff; font-weight: 800; font-size: 12px; color: #0284c7; }
        .totals-table .total-row td { border-top: 2px solid #0284c7; padding: 12px 10px; color: #0369a1; }
        
        /* Payments section */
        .payments-box { margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; }
        .payments-box h3 { font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .payment-item { display: table; width: 100%; padding: 6px 0; border-bottom: 1px dashed #cbd5e1; font-size: 9px; }
        .payment-item:last-child { border-bottom: none; }
        .payment-col { display: table-cell; color: #475569; }
        
        /* Legal footer */
        .legal-notice { margin-top: 40px; padding: 15px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 9px; color: #b45309; line-height: 1.5; }
        .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 8px; color: #94a3b8; }
    </style>
</head>
<body>
    @php
        $remaining = $invoice->remaining_amount;
        $isPaid = $remaining <= 0;
        $isPartial = $remaining < $invoice->total_amount && $remaining > 0;
    @endphp

    <!-- Status Watermark background -->
    @if($isPaid)
        <div class="watermark watermark-paid">PAYÉE</div>
    @else
        <div class="watermark watermark-unpaid">IMPAYÉE</div>
    @endif

    <div class="container">
        
        <!-- Header -->
        <table class="header-table">
            <tr>
                <td style="vertical-align: top;">
                    <div class="logo">🦷 DentistPro</div>
                    <div class="company-info">
                        <strong>Cabinet Dentaire DentistPro</strong><br>
                        123 Boulevard Mohamed V<br>
                        Casablanca, Maroc<br>
                        Tél : +212 5 22 45 67 89<br>
                        Email : contact@dentistpro.ma<br>
                        Patente : 12345678 - IF : 98765432
                    </div>
                </td>
                <td class="invoice-title-sec" style="vertical-align: top;">
                    <h1>FACTURE</h1>
                    <div class="invoice-number">N° {{ str_pad($invoice->id, 5, '0', STR_PAD_LEFT) }}</div>
                    <div>
                        <span class="status-badge {{ $isPaid ? 'status-paid' : ($isPartial ? 'status-partial' : 'status-pending') }}">
                            {{ $isPaid ? 'PAYÉE' : ($isPartial ? 'PARTIELLE' : 'IMPAYÉE') }}
                        </span>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Info Grid -->
        <table class="info-table">
            <tr>
                <td class="info-cell">
                    <h3>Patient</h3>
                    <p class="bold-val">{{ $invoice->patient->first_name }} {{ $invoice->patient->last_name }}</p>
                    <p>{{ $invoice->patient->address ?? 'Adresse non renseignée' }}</p>
                    <p>Tél : {{ $invoice->patient->phone }}</p>
                    <p>Email : {{ $invoice->patient->email }}</p>
                    @if($invoice->patient->cin)
                    <p>CIN : {{ $invoice->patient->cin }}</p>
                    @endif
                </td>
                <td class="info-cell">
                    <h3>Facture</h3>
                    <p>Date d'émission : <span class="bold-val">{{ $invoice->invoice_date->format('d/m/Y') }}</span></p>
                    <p>Date d'échéance : <span class="bold-val">{{ $invoice->invoice_date->addDays(30)->format('d/m/Y') }}</span></p>
                    @if($invoice->appointment)
                    <p>Date de soin : {{ $invoice->appointment->appointment_date->format('d/m/Y') }}</p>
                    @endif
                </td>
                <td class="info-cell">
                    <h3>Règlement</h3>
                    <p>Montant Total : <span class="bold-val">{{ number_format($invoice->total_amount, 2, ',', ' ') }} MAD</span></p>
                    @if($invoice->payments->sum('amount') > 0)
                    <p>Déjà Payé : <span class="bold-val" style="color: #059669;">{{ number_format($invoice->payments->sum('amount'), 2, ',', ' ') }} MAD</span></p>
                    @endif
                    @if($remaining > 0)
                    <p>Reste Dû : <span class="bold-val" style="color: #dc2626;">{{ number_format($remaining, 2, ',', ' ') }} MAD</span></p>
                    @endif
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 50%;">Description de la prestation</th>
                    <th class="text-center" style="width: 15%;">Quantité</th>
                    <th class="text-right" style="width: 17%;">Prix Unitaire (MAD)</th>
                    <th class="text-right" style="width: 18%;">Total TTC (MAD)</th>
                </tr>
            </thead>
            <tbody>
                @if($invoice->appointment && $invoice->appointment->treatment)
                    <tr>
                        <td>
                            <strong>{{ $invoice->appointment->treatment->name }}</strong><br>
                            <span style="font-size: 8px; color: #64748b;">{{ $invoice->appointment->treatment->description ?? 'Soin clinique' }}</span>
                        </td>
                        <td class="text-center">1</td>
                        <td class="text-right">{{ number_format($invoice->appointment->treatment->price, 2, ',', ' ') }}</td>
                        <td class="text-right">{{ number_format($invoice->appointment->treatment->price, 2, ',', ' ') }}</td>
                    </tr>
                @else
                    <tr>
                        <td>
                            <strong>Soins et Traitements Cliniques</strong><br>
                            <span style="font-size: 8px; color: #64748b;">Consultation standard et soins du cabinet.</span>
                        </td>
                        <td class="text-center">1</td>
                        <td class="text-right">{{ number_format($invoice->total_amount, 2, ',', ' ') }}</td>
                        <td class="text-right">{{ number_format($invoice->total_amount, 2, ',', ' ') }}</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- Totals Table -->
        <div class="totals-sec">
            <table class="totals-table">
                <tr>
                    <td class="text-right">Total HT :</td>
                    <td class="text-right bold-val">{{ number_format($invoice->total_amount / 1.2, 2, ',', ' ') }} MAD</td>
                </tr>
                <tr>
                    <td class="text-right">TVA (20%) :</td>
                    <td class="text-right bold-val">{{ number_format($invoice->total_amount - ($invoice->total_amount / 1.2), 2, ',', ' ') }} MAD</td>
                </tr>
                <tr class="total-row">
                    <td class="text-right">Total TTC :</td>
                    <td class="text-right bold-val">{{ number_format($invoice->total_amount, 2, ',', ' ') }} MAD</td>
                </tr>
            </table>
        </div>

        <!-- Payments Log -->
        @if($invoice->payments->count() > 0)
        <div class="payments-box">
            <h3>Historique des versements</h3>
            @foreach($invoice->payments as $payment)
            <div class="payment-item">
                <div class="payment-col" style="width: 40%;"><strong>Paiement reçu le {{ $payment->payment_date->format('d/m/Y') }}</strong></div>
                <div class="payment-col" style="width: 30%;">Mode : {{ strtoupper($payment->payment_method) }}</div>
                <div class="payment-col text-right" style="width: 30%; font-weight: bold; color: #059669;">+ {{ number_format($payment->amount, 2, ',', ' ') }} MAD</div>
            </div>
            @endforeach
        </div>
        @endif

        <!-- Legal Disclaimer -->
        <div class="legal-notice">
            <strong>📋 Informations Légales</strong><br>
            Cette facture est payable à réception. En cas de retard de paiement, des pénalités au taux légal en vigueur pourront être appliquées.
            Règlements acceptés : Espèces, Carte bancaire, Virement ou Chèque bancaire.
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Cabinet Dentaire DentistPro</strong> - Votre sourire, notre plus belle réussite</p>
            <p>Pour toute réclamation ou question sur cette facture, contactez-nous par téléphone au +212 5 22 45 67 89</p>
            <p style="margin-top: 12px;">Document généré le {{ now()->format('d/m/Y à H:i') }} | Page 1/1</p>
        </div>
    </div>
</body>
</html>
