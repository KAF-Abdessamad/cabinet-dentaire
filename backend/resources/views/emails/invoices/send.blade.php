<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre Facture - Cabinet Dentaire</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
        .invoice-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        .btn { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px; }
        .btn-secondary { background: #6b7280; }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #059669; font-size: 20px; margin-top: 0; }
        .invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
        .invoice-details { margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .detail-row:last-child { border-bottom: none; }
        .total-row { font-size: 18px; font-weight: bold; background: #f0fdf4; padding: 15px; border-radius: 5px; margin-top: 15px; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fee2e2; color: #991b1b; }
        .status-partial { background: #fef3c7; color: #92400e; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🦷 Votre Facture</h1>
        <p>Cabinet Dentaire DentistPro</p>
    </div>
    
    <div class="content">
        <h2>Bonjour {{ $invoice->patient->first_name }},</h2>
        
        <p>Nous vous remercions pour votre confiance. Vous trouverez ci-dessous les détails de votre facture.</p>
        
        <div class="invoice-box">
            <div class="invoice-header">
                <div>
                    <h3 style="margin: 0 0 5px 0; color: #059669;">FACTURE #{{ str_pad($invoice->id, 5, '0', STR_PAD_LEFT) }}</h3>
                    <p style="margin: 0; color: #6b7280;">Date : {{ $invoice->invoice_date->format('d/m/Y') }}</p>
                </div>
                <div style="text-align: right;">
                    @php
                        $remaining = $invoice->remaining_amount;
                        $isPaid = $remaining <= 0;
                        $isPartial = $remaining < $invoice->total_amount && $remaining > 0;
                    @endphp
                    <span class="status-badge {{ $isPaid ? 'status-paid' : ($isPartial ? 'status-partial' : 'status-pending') }}">
                        {{ $isPaid ? 'PAYÉE' : ($isPartial ? 'PARTIELLE' : 'IMPAYÉE') }}
                    </span>
                </div>
            </div>
            
            <div class="invoice-details">
                <div class="detail-row">
                    <span>Patient :</span>
                    <strong>{{ $invoice->patient->full_name }}</strong>
                </div>
                <div class="detail-row">
                    <span>Montant total :</span>
                    <strong>{{ number_format($invoice->total_amount, 2, ',', ' ') }} €</strong>
                </div>
                @if($invoice->payments->sum('amount') > 0)
                <div class="detail-row">
                    <span>Montant payé :</span>
                    <strong style="color: #059669;">{{ number_format($invoice->payments->sum('amount'), 2, ',', ' ') }} €</strong>
                </div>
                @endif
                @if($remaining > 0)
                <div class="detail-row" style="color: #dc2626;">
                    <span>Reste à payer :</span>
                    <strong>{{ number_format($remaining, 2, ',', ' ') }} €</strong>
                </div>
                @endif
            </div>
            
            <div class="total-row" style="display: flex; justify-content: space-between; align-items: center;">
                <span>TOTAL</span>
                <span style="font-size: 24px; color: #059669;">{{ number_format($invoice->total_amount, 2, ',', ' ') }} €</span>
            </div>
        </div>
        
        @if($remaining > 0)
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #991b1b;">⚠️ Paiement en attente</h3>
            <p style="margin: 0;">Il reste <strong>{{ number_format($remaining, 2, ',', ' ') }} €</strong> à régler.</p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">
                Modalités de paiement :<br>
                • Espèces ou carte bancaire au cabinet<br>
                • Virement bancaire (RIB disponible sur demande)
            </p>
        </div>
        @else
        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #065f46;">✅ Facture réglée</h3>
            <p style="margin: 0;">Nous vous remercions pour votre paiement.</p>
        </div>
        @endif
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="{{ route('invoices.pdf', $invoice) }}" class="btn">📄 Télécharger PDF</a>
            <a href="http://localhost:5173/patient/dashboard" class="btn btn-secondary">Espace Patient</a>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
            <h4 style="margin: 0 0 10px 0; color: #374151;">📋 Informations légales</h4>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
                Cabinet Dentaire DentistPro<br>
                123 Rue de la Santé, 75001 Paris<br>
                SIRET : 123 456 789 00010<br>
                N° TVA Intracommunautaire : FR 12 345678900
            </p>
        </div>
    </div>
    
    <div class="footer">
        <p>Cabinet Dentaire DentistPro - Votre sourire, notre priorité</p>
        <p>📞 01 23 45 67 89 | 📧 contact@cabinet.com</p>
        <p style="margin-top: 10px; font-size: 11px; color: #9ca3af;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
            Pour toute question concernant votre facture, contactez-nous directement.
        </p>
    </div>
</body>
</html>
