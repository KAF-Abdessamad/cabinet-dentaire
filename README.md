# Cabinet Dentaire - DentistPro

Application de gestion complète pour cabinet dentaire avec **Laravel 12** (Backend API) et **React** (Frontend).

## Architecture

Le projet est séparé en deux parties distinctes:

```
cabinet-dentaire/
├── backend/        # API Laravel 12
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── ...
├── frontend/       # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── css/
│   └── ...
└── package.json    # Orchestration des deux environnements
```

## Fonctionnalités

### Gestion des Patients (CRUD Complet)
- **Liste des patients** avec pagination et recherche (nom, email, téléphone, CIN)
- **Fiche patient complète** avec:
  - Informations personnelles et médicales
  - Historique des rendez-vous
  - Historique des soins effectués
  - Factures associées avec statuts de paiement
- **Création/Modification** avec validation des données
- **Suppression** sécurisée avec SoftDeletes

### Gestion des Rendez-vous
- **Calendrier des rendez-vous** avec filtres (date, patient, dentiste, statut)
- **Vérification de disponibilité** horaire automatique
- **Statuts**: En attente, Confirmé, Annulé, Terminé
- **Notifications email** automatiques:
  - Confirmation de rendez-vous
  - Rappel 24h avant le rendez-vous
- **Lien patient-rendez-vous** pour historique complet

### Gestion des Soins Dentaires
- **Catalogue des soins** avec prix
- **Lien soins-patients** via les rendez-vous
- **Calcul automatique** des montants
- **Suivi des traitements** effectués

### Facturation & Paiements
- **Génération de factures** automatique depuis les soins
- **Calcul automatique** du total (HT, TVA, TTC)
- **Statuts facture**: Payée, Partielle, Impayée
- **Génération PDF** professionnel avec laravel-dompdf
- **Envoi facture par email** avec pièce jointe PDF
- **Paiements partiels et totaux** avec historique complet
- **Mise à jour automatique** du statut facture après paiement

### Tableau de Bord Admin
- **Statistiques en temps réel**:
  - Nombre de patients total
  - Rendez-vous du jour et de la semaine
  - Revenus du mois
  - Factures en attente
- **Activité récente** (nouveaux patients, paiements, rendez-vous)
- **Graphique des revenus** sur 6 mois

### Sécurité & Permissions
- **Policies Laravel** pour chaque ressource:
  - PatientPolicy: contrôle d'accès aux dossiers patients
  - AppointmentPolicy: gestion des rendez-vous
  - InvoicePolicy: sécurisation des factures
  - PaymentPolicy: contrôle des paiements
- **Middleware de rôles** (admin, dentiste, assistant, secrétaire, patient)
- **Protection CSRF** sur tous les formulaires
- **Validation** des données entrantes avec FormRequests
- **Authentification** requise sur toutes les routes sensibles

## Prérequis

- PHP 8.2+
- Composer
- Node.js 18+ & NPM
- SQLite ou MySQL

## Installation Rapide

### 1. Backend (Laravel API)

```bash
cd backend

# Installer les dépendances PHP
composer install

# Configuration
cp .env.example .env
php artisan key:generate

# Configurer la base de données dans .env, puis:
php artisan migrate --seed

# Démarrer le serveur API
php artisan serve
```

API disponible sur: `http://localhost:8000`

### Accès Application

| URL | Description | Identifiants |
|-----|-------------|--------------|
| `http://localhost:5173` | Landing Page (choix patient/admin) | - |
| `http://localhost:5173/login` | Espace Patient (connexion/inscription) | Créer un compte ou utiliser un patient existant |
| `http://localhost:5173/admin/login` | Connexion Admin/Staff | admin@cabinet.com / admin123 |
| `http://localhost:8000/admin/dashboard` | Dashboard Admin Laravel | Connexion requise |
| `http://localhost:8000/admin/patients` | Gestion patients (CRUD complet) | Rôle admin/dentiste/assistant requis |
| `http://localhost:8000/admin/appointments` | Gestion rendez-vous | Rôle admin/dentiste/assistant requis |
| `http://localhost:8000/admin/invoices` | Gestion factures | Rôle admin/dentiste/assistant requis |

### 2. Frontend (React)

```bash
cd frontend

# Installer les dépendances Node
npm install

# Démarrer le serveur de développement
npm run dev
```

Application disponible sur: `http://localhost:5173`

## Installation Automatisée (Racine)

Depuis la racine du projet, vous pouvez orchestrer les deux environnements:

```bash
# Installation des dépendances
npm run install:all

# Démarrer backend + frontend simultanément
npm run dev

# Exécuter les migrations
npm run migrate

# Exécuter les seeders
npm run seed

# Build production du frontend
npm run build
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
cd backend && php artisan db:seed --class=AdminUserSeeder
```

## Tests

```bash
# Exécuter tous les tests (backend)
cd backend && php artisan test

# Tests spécifiques
cd backend && php artisan test --filter=AuthTest
cd backend && php artisan test --filter=PatientTest
cd backend && php artisan test --filter=AppointmentTest
```

## Déploiement

1. **Serveur**: Configurez PHP 8.2+, extensions requises
2. **Base de données**: Importez la structure SQL
3. **Storage**: `chmod -R 775 storage bootstrap/cache`
4. **Queue**: Configurez un worker pour les emails
5. **Cron**: Ajoutez les tâches planifiées (rappels de rendez-vous)

## API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/dashboard/stats` | GET | Statistiques du tableau de bord |
| `/api/patients` | GET/POST | Liste / Créer patient |
| `/api/patients/{id}` | GET/PUT/DELETE | Détail / Modifier / Supprimer |
| `/api/appointments` | GET/POST | Liste / Créer rendez-vous |
| `/api/appointments/{id}` | GET/PUT/DELETE | Détail / Modifier / Supprimer |

## Développement

### Ports par défaut

- **Backend API**: `http://localhost:8000`
- **Frontend Dev**: `http://localhost:5173`

### Configuration CORS

Le backend est configuré pour accepter les requêtes du frontend:

```php
// backend/config/cors.php
'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:3000',
],
'supports_credentials' => true,
```

### Commandes Backend

```bash
cd backend

# Rappels automatiques des rendez-vous
php artisan app:send-appointment-reminders

# Optimisation production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Commandes Frontend

```bash
cd frontend

# Mode développement avec hot reload
npm run dev

# Build production (génère le dossier dist/)
npm run build

# Preview du build production
npm run preview
```

## Sécurité

- Protection CSRF sur tous les formulaires
- Policies Laravel pour contrôle d'accès
- Validation des données entrantes
- Authentification requise sur toutes les routes
- Middleware de rôle pour accès restreint

## License

MIT License
