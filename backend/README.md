# Cabinet Dentaire - DentistPro

Application de gestion complète pour cabinet dentaire développée avec Laravel 12.

## Fonctionnalités

- **Gestion des patients**: Dossiers patients avec historique médical
- **Gestion des rendez-vous**: Planification avec vérification de disponibilité
- **Facturation**: Création de factures avec PDF et envoi par email
- **Paiements**: Suivi des paiements partiels/totaux avec historique
- **Ordonnances**: Génération et impression d'ordonnances
- **Tableau de bord**: Statistiques en temps réel et activité récente
- **Sécurité**: Rôles et permissions (Admin, Dentiste, Secrétaire)

## Prérequis

- PHP 8.2+
- Composer
- Node.js & NPM
- SQLite ou MySQL

## Installation

```bash
# Cloner le projet
git clone [repository-url]
cd cabinet-dentaire

# Installer les dépendances
composer install
npm install

# Configuration
cp .env.example .env
php artisan key:generate

# Base de données
php artisan migrate --seed

# Compilation des assets
npm run build

# Démarrer le serveur
php artisan serve
```

## Configuration Email

Dans `.env`, configurez votre serveur SMTP:
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@gmail.com
MAIL_PASSWORD=votre-mot-de-passe
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=votre-email@gmail.com
MAIL_FROM_NAME="Cabinet Dentaire DentistPro"
```

## Rôles Utilisateurs

- **Admin**: Accès complet à toutes les fonctionnalités
- **Dentiste**: Gestion des patients, rendez-vous, ordonnances
- **Secrétaire**: Rendez-vous, facturation, paiements

Créer un utilisateur admin:
```bash
php artisan db:seed --class=AdminUserSeeder
```

## Tests

```bash
# Exécuter tous les tests
php artisan test

# Tests spécifiques
php artisan test --filter=AuthTest
php artisan test --filter=PatientTest
php artisan test --filter=AppointmentTest
```

## Déploiement

1. **Serveur**: Configurez PHP 8.2+, extensions requises
2. **Base de données**: Importez la structure SQL
3. **Storage**: `chmod -R 775 storage bootstrap/cache`
4. **Queue**: Configurez un worker pour les emails
5. **Cron**: Ajoutez les tâches planifiées (rappels de rendez-vous)

## Commandes Utiles

```bash
# Rappels automatiques des rendez-vous
php artisan app:send-appointment-reminders

# Optimisation production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Sécurité

- Protection CSRF sur tous les formulaires
- Policies Laravel pour contrôle d'accès
- Validation des données entrantes
- Authentification requise sur toutes les routes
- Middleware de rôle pour accès restreint

## License

MIT License
