<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de Rendez-vous</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        .btn { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #059669; font-size: 18px; margin-top: 0; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✓ Confirmation de Rendez-vous</h1>
        <p>Cabinet Dentaire DentistPro</p>
    </div>
    
    <div class="content">
        <h2>Bonjour {{ $appointment->patient->first_name }},</h2>
        
        <p>Votre rendez-vous a été confirmé avec succès. Voici les détails :</p>
        
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
        
        <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <strong>📍 Adresse du cabinet :</strong><br>
            123 Rue de la Santé<br>
            75001 Paris, France<br>
            Tél : 01 23 45 67 89
        </p>
        
        <p style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <strong>ℹ️ Informations importantes :</strong><br>
            • Veuillez arriver 15 minutes avant votre rendez-vous<br>
            • En cas d'indisponibilité, merci de nous prévenir 24h à l'avance<br>
            • Pensez à apporter votre carte vitale et mutuelle
        </p>
        
        <div style="text-align: center;">
            <a href="http://localhost:5173/patient/dashboard" class="btn">Accéder à mon espace</a>
        </div>
    </div>
    
    <div class="footer">
        <p>Cabinet Dentaire DentistPro - Votre sourire, notre priorité</p>
        <p>Si vous avez des questions, contactez-nous au 01 23 45 67 89</p>
        <p style="margin-top: 10px; font-size: 11px; color: #9ca3af;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </p>
    </div>
</body>
</html>
