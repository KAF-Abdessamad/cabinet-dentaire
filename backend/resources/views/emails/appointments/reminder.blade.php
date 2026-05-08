<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rappel de Rendez-vous</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #1d4ed8; font-size: 18px; margin-top: 0; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #6b7280; }
        .reminder-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; text-align: center; }
        .reminder-box h3 { margin: 0 0 10px 0; color: #92400e; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⏰ Rappel de Rendez-vous</h1>
        <p>Cabinet Dentaire DentistPro</p>
    </div>
    
    <div class="content">
        <h2>Bonjour {{ $appointment->patient->first_name }},</h2>
        
        <div class="reminder-box">
            <h3>⚠️ Votre rendez-vous approche !</h3>
            <p style="font-size: 18px; margin: 0;">
                <strong>{{ $appointment->appointment_date->format('d/m/Y') }}</strong> à <strong>{{ $appointment->start_time }}</strong>
            </p>
            <p style="margin: 10px 0 0 0;">Dans {{ $appointment->appointment_date->diffForHumans() }}</p>
        </div>
        
        <div class="info-box">
            <div class="detail">
                <span class="label">Date :</span> {{ $appointment->appointment_date->format('d/m/Y') }}
            </div>
            <div class="detail">
                <span class="label">Heure :</span> {{ $appointment->start_time }} - {{ $appointment->end_time }}
            </div>
            <div class="detail">
                <span class="label">Dentiste :</span> Dr. {{ $appointment->dentist->name ?? 'Non assigné' }}
            </div>
            <div class="detail">
                <span class="label">Motif :</span> {{ $appointment->reason ?? 'Consultation générale' }}
            </div>
        </div>
        
        <p style="background: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
            <strong>🚨 Important :</strong><br>
            Si vous ne pouvez pas vous présenter, merci de nous contacter au plus vite au <strong>01 23 45 67 89</strong> pour reporter votre rendez-vous.
        </p>
        
        <p style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
            <strong>✅ À apporter :</strong><br>
            • Carte Vitale<br>
            • Carte de mutuelle<br>
            • Liste des médicaments en cours (si applicable)
        </p>
        
        <div style="text-align: center;">
            <a href="http://localhost:5173/patient/dashboard" class="btn">Voir mon rendez-vous</a>
        </div>
    </div>
    
    <div class="footer">
        <p>Cabinet Dentaire DentistPro - Votre sourire, notre priorité</p>
        <p>📞 01 23 45 67 89 | 📧 contact@cabinet.com</p>
        <p style="margin-top: 10px; font-size: 11px; color: #9ca3af;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
    </div>
</body>
</html>
