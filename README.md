# 🦷 DentistPro - Cabinet Dentaire Révolutionnaire

DentistPro est un progiciel de gestion clinique et administrative moderne, conçu spécifiquement pour les cabinets dentaires haut de gamme. Bâti sur une architecture robuste à services découplés (**Laravel 12 API** et **React SPA + Vite + TailwindCSS**), il intègre des fonctionnalités avancées de planification sans conflit, de dossiers cliniques interactifs et de facturation sécurisée.

---

## 📊 Diagramme d'Architecture Système

Voici l'architecture technique premium de DentistPro :

```mermaid
graph TD
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef storage fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;

    subgraph Client [Interface Utilisateur - React SPA]
        A["Dashboard & Fiche Patient (TailwindCSS)"]:::frontend
        B["Schéma Dentaire Interactif (FDI standard)"]:::frontend
        C["Agenda de réservation sans conflit"]:::frontend
    end

    subgraph API [Serveur API - Laravel 12]
        D["Sanctum Auth & Policies"]:::backend
        E["AppointmentService (Moteur anti-conflit)"]:::backend
        F["Notification Queue Jobs (Mail/SMS)"]:::backend
    end

    subgraph Persistence [Stockage des Données]
        G[("Base de données (MySQL / SQLite)")]:::storage
        H[("Cache & Sessions (Redis / Database)")]:::storage
    end

    A -->|Requêtes REST avec Credentials| D
    B -->|Mise à jour des actes cliniques| E
    C -->|Vérification de chevauchements| E
    D --> G
    E --> G
    F -->|Traitement asynchrone| H
    D -->|Cache des Stats (TTL 5 min)| H
```

---

## 🛠️ Bibliothèque de Composants Réutilisables (`frontend/src/components/ui/`)

Nous avons implémenté une suite de composants hautement interactifs et stylisés pour garantir la réutilisabilité et la cohérence graphique du design system DentistPro :

1. **`StatusBadge`** : Badge de statut stylisé en français (*En attente*, *Confirmé*, *Annulé*, *Terminé*, *Payée*, *Partiel*, *Impayée*).
2. **`PatientAvatar`** : Avatar adaptatif générant une couleur HSL unique et stable à partir du nom du patient, avec support d'image lazy-loadée.
3. **`DateRangePicker`** : Double calendrier réceptif avec presets temporels instantanés.
4. **`SearchableSelect`** : Select asynchrone avec recherche intégrée, multi-sélection et ajout à la volée.
5. **`ConfirmModal`** : Fenêtre modale de confirmation multi-variants (*danger*, *warning*, *info*) animée via Framer Motion.
6. **`DataTable`** : Table de données avec tri intelligent, pagination et export CSV intégré.
7. **`StatCard`** : Carte KPI avec animation dynamique de compteur numérique (*Count-Up*) au chargement de la page.
8. **`TimelineItem`** : Composant de frise chronologique dynamique pour l'historique des soins.
9. **`EmptyState`** : Section d'état vide illustrée avec bouton d'appel à l'action.
10. **`PageHeader`** : En-tête de page unifié avec fil d'Ariane (*Breadcrumb*) et boutons d'actions contextuels.

---

## 🚀 Guide de Déploiement Pas-à-Pas (Production)

### 1. Prérequis Serveur
- PHP 8.2+ (avec extensions `pdo_mysql`, `redis`, `gd`, `zip`, `xml`)
- Serveur Web (Nginx ou Apache)
- Base de données MySQL 8+ ou MariaDB
- Node.js 18+ & NPM

### 2. Configuration Backend (Laravel API)
Déplacez-vous dans le répertoire du serveur d'API :
```bash
cd backend
composer install --no-dev --optimize-autoloader
```

Configurez l'environnement de production à partir du template d'exemple fourni :
```bash
cp .env.production.example .env
php artisan key:generate
```
*Éditez le fichier `.env` pour y saisir vos identifiants MySQL, Redis et serveurs SMTP.*

Exécutez les migrations de base de données (incluant les nouveaux index de performance et tables administratives) :
```bash
php artisan migrate --force --seed
```

Configurez les liens symboliques et mettez en cache les configurations de production :
```bash
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Configurez le superviseur de file d'attente (Queue Worker) pour l'envoi d'emails asynchrones :
```bash
php artisan queue:work --queue=default --sleep=3 --tries=3
```

### 3. Build & Déploiement du Frontend (React)
Déplacez-vous dans le répertoire de l'application cliente :
```bash
cd ../frontend
npm install
npm run build
```
*Le build de production optimisé est automatiquement généré dans le dossier `/backend/public/` pour être directement servi par votre serveur Nginx/Apache.*

---

## ⚙️ Tests & Validation

### Backend (PHPUnit)
Exécutez la suite complète de tests unitaires et d'intégration couvrant la sécurité visible et la logique métier :
```bash
cd backend
php artisan test
```

### Frontend (Vitest + React Testing Library)
Exécutez les tests de rendu et de comportement des formulaires et calculs financiers :
```bash
cd frontend
npm run test  # ou npx vitest
```

---

## 🛟 Résolution des Erreurs Courantes (Troubleshooting)

#### 🔴 Erreur 419 Page Expired / CSRF Token Mismatch
- **Cause** : Les domaines autorisés pour les cookies de session ou l'état de Sanctum ne correspondent pas à l'URL réelle.
- **Solution** : Vérifiez que `SANCTUM_STATEFUL_DOMAINS` et `SESSION_DOMAIN` sont correctement renseignés dans votre fichier `.env` de production.

#### 🔴 Erreur 409 Conflict lors de la prise de rendez-vous
- **Cause** : Le créneau horaire ou la durée du soin demandée chevauche un rendez-vous existant pour le même praticien.
- **Solution** : Choisissez un autre créneau. Le cabinet est également configuré pour bloquer les réservations le dimanche et les jours fériés.

#### 🔴 Emails de rappel non envoyés
- **Cause** : Le planificateur de tâches Laravel (Cron Job) n'est pas activé ou le processus de queue est arrêté.
- **Solution** : Ajoutez la ligne suivante dans le crontab de votre serveur Linux :
  ```bash
  * * * * * cd /chemin/vers/votre/projet/backend && php artisan schedule:run >> /dev/null 2>&1
  ```
  Et assurez-vous que `php artisan queue:work` tourne en arrière-plan (via un démon Supervisor).
