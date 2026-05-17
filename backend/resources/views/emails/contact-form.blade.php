<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau message de contact</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Cabinet Dentaire</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Nouveau message de contact</p>
    </div>

    <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">Détails du message</h2>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280; width: 150px;">Nom :</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">{{ $data['name'] }}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Email :</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">
                    <a href="mailto:{{ $data['email'] }}" style="color: #0ea5e9; text-decoration: none;">{{ $data['email'] }}</a>
                </td>
            </tr>
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #6b7280;">Sujet :</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">{{ $data['subject'] }}</td>
            </tr>
        </table>

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 10px;">Message :</h3>
            <p style="color: #4b5563; margin: 0; white-space: pre-wrap;">{{ $data['message'] }}</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Ce message a été envoyé via le formulaire de contact du site web du cabinet dentaire.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
                Date d'envoi : {{ now()->format('d/m/Y H:i') }}
            </p>
        </div>
    </div>
</body>
</html>
