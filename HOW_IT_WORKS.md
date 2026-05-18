# ⚙️ Guide de Fonctionnement - DentistPro
## *Comprendre l'Architecture, les Processus Métier et le Lancement Technique*

Ce document explique en détail le fonctionnement interne de **DentistPro**, tant sur le plan opérationnel (flux métier de gestion clinique) que sur le plan technique (architecture logicielle, structures de base de données, sécurité).

---

## Table des Matières
1. [Démarrage Rapide (Lancement Local)](#1-démarrage-rapide-lancement-local)
2. [Architecture Technique Globale](#2-architecture-technique-globale)
3. [Fonctionnement du Backend (Laravel API)](#3-fonctionnement-du-backend-laravel-api)
4. [Fonctionnement du Frontend (React SPA)](#4-fonctionnement-du-frontend-react-spa)
5. [Processus Métier : Le Moteur Anti-Conflit](#5-processus-métier--le-moteur-anti-conflit)
6. [Processus Métier : La Facturation Automatique](#6-processus-métier--la-facturation-automatique)
7. [Vérification & Lancement des Tests (QA)](#7-vérification--lancement-des-tests-qa)

---

## 1. Démarrage Rapide (Lancement Local)

Pour faire fonctionner DentistPro sur votre machine de développement locale, suivez ces étapes simples.

### 1.1 Lancement du Backend (API Laravel)
Assurez-vous d'avoir PHP 8.2+ et Composer installés.

1. Rendez-vous dans le dossier backend :
   ```powershell
   cd backend
   ```
2. Installez les dépendances Composer :
   ```powershell
   composer install
   ```
3. Créez votre fichier de configuration locale `.env` :
   ```powershell
   cp .env.example .env
   ```
4. Générez la clé de sécurité de l'application :
   ```powershell
   php artisan key:generate
   ```
5. Lancez les migrations de base de données et pré-remplissez les rôles et permissions (Spatie) :
   ```powershell
   php artisan migrate --seed
   ```
6. Démarrez le serveur de développement Laravel :
   ```powershell
   php artisan serve
   ```
   *L'API sera accessible sur `http://127.0.0.1:8000`.*

### 1.2 Lancement du Frontend (React + Vite)
Assurez-vous d'avoir Node.js 18+ installé.

1. Rendez-vous dans le dossier frontend :
   ```powershell
   cd ../frontend
   ```
2. Installez les packages NPM :
   ```powershell
   npm install
   ```
3. Démarrez le serveur de développement de l'interface utilisateur :
   ```powershell
   npm run dev
   ```
   *L'interface utilisateur sera accessible sur `http://localhost:5173` (ou l'adresse affichée dans votre terminal).*

---

## 2. Architecture Technique Globale

DentistPro utilise une architecture à services découplés hautement performante.

```
       +--------------------------------------------+
       |           Client (React SPA)               |
       |  Interface graphique moderne (Tailwind)    |
       +--------------------+-----------------------+
                            |
            Requêtes JSON   |   Authentification
            RESTful API     |   Via Laravel Sanctum
                            v
       +--------------------+-----------------------+
       |         Serveur API (Laravel)              |
       |  Gestion des routes, politiques & calculs  |
       +--------------------+-----------------------+
                            |
           Requêtes SQL     |   Moteur Eloquent
           Transactionnelles|   Tables indexées
                            v
       +--------------------+-----------------------+
       |         Base de données (MySQL)            |
       |  Patients, RDV, Factures, Règlements       |
       +--------------------------------------------+
```

---

## 3. Fonctionnement du Backend (Laravel API)

Le backend Laravel sert de moteur central. Il expose des routes API structurées et protège les données médicales des patients.

### 3.1 Structure du Code Backend
- **Contrôleurs ([backend/app/Http/Controllers/](file:///c:/Users/kafab/Desktop/cabinet-dentaire/backend/app/Http/Controllers/))** : Reçoivent les requêtes du SPA client, vérifient les autorisations, exécutent les services métier et retournent les réponses.
- **Politiques de Sécurité ([backend/app/Policies/](file:///c:/Users/kafab/Desktop/cabinet-dentaire/backend/app/Policies/))** : Implémentent les règles d'accès au niveau des modèles (ex: qui a le droit de modifier une fiche patient, de supprimer un rendez-vous).
- **Modèles Éléments ([backend/app/Models/](file:///c:/Users/kafab/Desktop/cabinet-dentaire/backend/app/Models/))** : Représentent les tables SQL. Intègrent des événements Eloquent automatiques (ex: synchronisation automatique des dates de début/fin lors de la mise à jour d'un rendez-vous).

### 3.2 Modèle de Données Clé : Soft Deletes
Pour des raisons de traçabilité clinique et fiscale, les modèles comme **Patient** et **Appointment** n'utilisent pas de suppressions matérielles. Au lieu de cela, ils exploitent le trait `SoftDeletes` d'Eloquent :
- Lors d'une suppression, la colonne `deleted_at` est remplie.
- Le patient ou rendez-vous disparaît des interfaces courantes, mais son historique de soins et ses transactions financières restent stockés en base pour assurer la conformité lors des audits.

---

## 4. Fonctionnement du Frontend (React SPA)

L'application cliente est développée en **React** et compilée avec le bundle ultra-rapide **Vite**.

### 4.1 Injection transparente de Session & jeton CSRF
Pour que l'authentification et les requêtes soient sécurisées sans friction :
- Nginx ou Laravel sert le fichier de build `public/index.html`.
- Lors du chargement de la page, le serveur web injecte dynamiquement des balises `<meta>` contenant :
  1. Le jeton CSRF actif pour crypter les formulaires.
  2. Les données de session de l'utilisateur connecté (ID, email, nom, rôle).
- Le frontend React lit ces balises à l'initialisation pour configurer automatiquement son état global d'authentification (`AuthContext`) et les en-têtes Axios de toutes les requêtes futures.

### 4.2 Le Design System Premium
Tous les écrans partagent un ensemble de composants d'UI réutilisables situés dans `frontend/src/components/ui/` :
- **`PatientAvatar`** : Génère dynamiquement une couleur unique et stable basée sur l'algorithme de hash HSL à partir du nom du patient, évitant ainsi d'avoir recours à des images par défaut ennuyeuses.
- **`StatusBadge`** : Formate de manière élégante et dynamique les statuts de facturation ou d'agenda avec des dégradés de couleurs harmonieux et professionnels.
- **`DataTable`** : Gère le tri des lignes côté client, la pagination rapide et l'exportation des données cliniques en CSV d'un simple clic.

---

## 5. Processus Métier : Le Moteur Anti-Conflit

L'agenda des consultations est contrôlé par un puissant algorithme anti-chevauchement.

### 5.1 Règles de validation temporelle
Lorsqu'une secrétaire ou un praticien enregistre un rendez-vous, le système valide automatiquement plusieurs aspects :
1. **Disponibilité du Dentiste** : Une requête SQL transactionnelle vérifie si le dentiste sélectionné n'a pas déjà un rendez-vous confirmé qui chevauche la plage demandée :
   $$starts\_at < proposed\_ends\_at \quad \text{et} \quad ends\_at > proposed\_starts\_at$$
2. **Jours Ouvrés** : Les rendez-vous le dimanche sont bloqués.
3. **Heures d'Ouverture** : Les consultations ne peuvent être planifiées qu'entre $08\text{h}00$ et $18\text{h}00$.
4. **Jours Fériés** : Le cabinet intègre un tableau dynamique de jours fériés (fixes et mobiles) empêchant toute planification ces jours-là.

---

## 6. Processus Métier : La Facturation Automatique

DentistPro élimine les saisies financières manuelles redondantes grâce à l'automatisation des flux.

```
       +---------------------------------------------+
       |   Le Praticien effectue les soins           |
       |  (Ex: Pose de couronne, détartrage)         |
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |   Le Praticien passe le statut du RDV à    |
       |               "completed"                   |
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |   L'Événement Eloquent capture le changement |
       |   de statut et calcule la somme des soins    |
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |   Création instantanée de la facture        |
       |   avec le montant exact calculé en "pending"|
       +---------------------------------------------+
```

### 6.1 Règlements multiples et Solde
- Une facture peut être soldée par plusieurs règlements successifs (paiement par chèque, espèces ou carte).
- À chaque ajout de règlement via [InvoiceController@addPayment](file:///c:/Users/kafab\Desktop/cabinet-dentaire/backend/app/Http/Controllers/InvoiceController.php#L69-L70), le système recalcule le solde :
  - Si la somme des paiements est inférieure au montant total : le statut de la facture passe à `partially_paid`.
  - Si la somme des paiements couvre ou dépasse le montant total : le statut de la facture passe à `paid` (facture soldée).

---

## 7. Vérification & Lancement des Tests (QA)

Pour s'assurer que le système fonctionne parfaitement et qu'aucune modification future ne brise la logique métier, exécutez la suite de tests complète.

### 7.1 Lancement des tests Backend (PHPUnit)
Depuis le dossier `backend` :
```powershell
php artisan test
```

### 7.2 Lancement des tests Frontend (Vitest)
Depuis le dossier `frontend` :
```powershell
npm run test
```

Toutes les fonctions clés (création de patients, calculs financiers, règles d'agenda sans conflit, restrictions de sécurité RBAC) sont couvertes par cette suite pour garantir un code d'une qualité de niveau entreprise.
