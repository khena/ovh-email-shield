<div align="center">
  <img src="icons/icon.svg" alt="OVH Email Shield Logo" width="96" height="96">
  <h1>OVH Email Shield</h1>
  <p><strong>Extension multi-navigateurs (Firefox & Chrome) pour générer des alias emails jetables via votre propre domaine OVHcloud.</strong></p>

  <p>
    <strong>🇫🇷 Version française</strong> • <a href="./README.en.md">🇬🇧 English version</a>
  </p>

  <p>
    <a href="https://addons.mozilla.org/addon/ovh-email-shield/"><img src="https://img.shields.io/badge/Firefox_Add--ons-Installer-orange?logo=firefox-browser" alt="Installer sur Firefox"></a>
    <a href="https://chromewebstore.google.com/detail/ovh-email-shield/mceniipefgoijaplocajlmihcpecaldg"><img src="https://img.shields.io/badge/Chrome_Web_Store-Installer-blue?logo=google-chrome" alt="Installer sur Chrome"></a>
    <a href="./tests/"><img src="https://img.shields.io/badge/tests-125%20passing-brightgreen?logo=node.js" alt="Tests"></a>
    <a href="./USER_GUIDE.md"><img src="https://img.shields.io/badge/documentation-Mode%20d'emploi-blue" alt="Mode d'emploi"></a>
    <img src="https://img.shields.io/badge/télémétrie-zéro-success" alt="Zéro télémétrie">
    <img src="https://img.shields.io/badge/développé%20avec-Google%20Gemini-8e44ad?logo=google" alt="Développé avec Google Gemini">
    <a href="./LICENSE"><img src="https://img.shields.io/badge/licence-MPL--2.0-blue.svg" alt="Licence"></a>
  </p>
</div>

---

## 💡 Le Problème & La Solution

Chaque fois que vous donnez votre véritable adresse email à un site web, vous risquez :
- D'être revendu à des courtiers de données publicitaires.
- De subir des campagnes de spam interminables sans possibilité de désinscription propre.
- D'exposer votre adresse lors d'une fuite de données (*data breach*).

**OVH Email Shield** transforme votre propre nom de domaine hébergé chez OVHcloud en **bouclier anti-spam souverain**. En un clic (ou via clic droit), l'extension génère un alias aléatoire unique (ex: `shield-x8m2q9@mondomaine.fr`) et configure immédiatement sa redirection vers votre vraie boîte mail.

> **Pourquoi utiliser OVH Email Shield plutôt qu'un service tiers (SimpleLogin, Firefox Relay, DuckDuckGo) ?**
> - **Souveraineté totale :** Vos alias utilisent *votre* nom de domaine.
> - **Gratuit & Illimité :** Inclus avec l'offre mail de base (MX Plan) de tout nom de domaine OVHcloud.
> - **Zéro intermédiaire :** Aucun serveur tiers ne lit ou ne transfère vos emails. La redirection est gérée directement au niveau de l'infrastructure d'OVH.

---

## ⚠️ Avertissements importants & Cas d'usage

Avant d'installer ou d'utiliser cette extension, prenez impérativement connaissance des points suivants :

- 🔑 **Gestionnaire de mots de passe indispensable :** Chaque alias généré étant unique et aléatoire (ex: `shield-x8m2q9@mondomaine.fr`), cette extension **n'est intéressante que si vous utilisez un gestionnaire de mots de passe** (Bitwarden, 1Password, KeePass, Proton Pass, etc.) pour enregistrer automatiquement l'adresse générée comme identifiant de connexion. Sans gestionnaire, vous risquez de ne plus vous souvenir de l'adresse utilisée pour vous connecter.
- 🛠️ **Création de redirections uniquement (pas de management complet) :** L'extension est conçue pour **créer rapidement des redirections** lors de votre navigation (avec historique récent et suppression rapide). Elle ne remplace pas une interface complète de gestion d'emails : pour modifier une redirection, changer sa destination, auditer l'ensemble des alias du domaine ou surveiller vos quotas, vous devez obligatoirement passer par l'**Espace Client OVHcloud Manager**.
- 💰 **Pertinence tarifaire :** Si vous ne possédez **pas déjà un nom de domaine hébergé chez OVHcloud**, ne prenez pas cette solution ! Acheter un nom de domaine uniquement pour cela vous coûtera plus cher que d'adopter une solution clé en main dédiée (comme SimpleLogin, Addy.io, Proton Pass ou Firefox Relay).
- 🏰 **Souveraineté & Indépendance :** Cette extension a été pensée pour ceux qui ont déjà leur domaine chez OVHcloud et souhaitent **garder le contrôle absolu sur leurs données** et leur infrastructure, sans ajouter un intermédiaire tiers payant qui relaie ou stocke leurs emails.

---

## ✨ Fonctionnalités

- ⚡ **Injection optimiste (0 ms) :** Génération locale instantanée avec vérification anti-collision, injection dans la page et copie immédiates sans attendre la latence réseau de l'API OVH.
- 🛡️ **Génération en 1 clic :** Créez instantanément un alias depuis la popup de la barre d'outils.
- ⚡ **Auto-remplissage par clic-droit :** Menu contextuel sur les champs de formulaires (`input`, `textarea`, `contenteditable`) avec injection compatible React, Vue, Angular et Vanilla.
- 📋 **Copie automatique :** L'alias créé est immédiatement copié dans le presse-papier avec confirmation visuelle.
- 🗂️ **Historique & Révocation :** Visualisez les 50 derniers alias créés et révoquez (supprimez) n'importe quelle redirection chez OVH d'un clic sur la corbeille.
- 🌐 **Identification du site web :** Détection automatique du site visité inséré dans le préfixe si votre modèle contient `[site]` (ex: `shield.[site]-[rand]` ➔ `shield.amazon-x8m2@mondomaine.fr`).
- 🎨 **Format 100 % personnalisable :** Combinez librement `[site]` et `[rand]` dans les options (ex: `shield.[site]-[rand]`, ou simplement `shield-[rand]` pour désactiver l'affichage du site).
- ⏱️ **Synchronisation temporelle :** Ajustement automatique du décalage d'horloge avec l'API OVH pour éliminer les erreurs de signature.
- 🔒 **Confidentialité absolue :** Zéro serveur tiers, zéro tracker, stockage local chiffré dans le profil Firefox.

---

## 📖 Mode d'emploi Complet

Pour un tutoriel détaillé étape par étape (création des clés API sur OVH, droits d'accès minimaux, résolution des problèmes fréquents), consultez :

👉 **[Consulter le Mode d'emploi détaillé (USER_GUIDE.md)](./USER_GUIDE.md)**

---

## 🚀 Installation & Utilisation

### 🛒 Installation officielle (Recommandée)

Installez directement l'extension validée depuis le store officiel de votre navigateur :

| Navigateur | Installation directe |
|---|---|
| **Mozilla Firefox** | [![Installer sur Firefox](https://img.shields.io/badge/Firefox_Add--ons-Installer-orange?logo=firefox-browser)](https://addons.mozilla.org/addon/ovh-email-shield/) |
| **Google Chrome / Chromium** (Brave, Edge, Vivaldi, Opera) | [![Installer sur Chrome](https://img.shields.io/badge/Chrome_Web_Store-Installer-blue?logo=google-chrome)](https://chromewebstore.google.com/detail/ovh-email-shield/mceniipefgoijaplocajlmihcpecaldg) |

---

### 🛠️ Installation manuelle ou développeur (depuis les sources)

#### Option A : Charger temporairement dans Firefox (sans installation globale)
1. Téléchargez ou clonez ce dépôt :
   ```bash
   git clone https://github.com/khena/ovh-email-shield.git
   cd ovh-email-shield
   ```
2. Dans Firefox, ouvrez `about:debugging#/runtime/this-firefox`.
3. Cliquez sur **« Charger un module temporaire... »**.
4. Sélectionnez le fichier `manifest.json` à la racine du projet.
5. L'icône de bouclier apparaît dans votre barre d'outils !

#### Option B : Environnement Développeur

```bash
# 1. Cloner et installer les dépendances
npm install

# 2. Lancer Firefox avec rechargement automatique (hot-reload)
npm start

# 3. Lancer la suite de tests unitaires (125 tests natifs)
npm test

# 4. Vérifier la conformité du code et du manifest
npm run lint

# 5. Compiler l'archive de production optimisée (zip épuré de 25 Ko)
npm run build

# 6. Synchroniser / incrémenter la version (package.json + manifest.json)
npm run bump 1.0.2    # ou npm version patch
```

### 📦 Workflow de Release (GitHub Action)

Le projet intègre un pipeline CI/CD automatisé (`.github/workflows/release.yml`) :

```bash
# 1. Incrémenter la version
npm run bump 1.0.2

# 2. Commiter et créer le tag Git
git commit -am "chore: release v1.0.2"
git tag v1.0.2

# 3. Pousser vers GitHub
git push origin main --tags
```

Le workflow GitHub teste le code, exécute le linter, compile l'archive et publie automatiquement la **GitHub Release** avec le `.zip` joint en téléchargement direct.

---

## 🔒 Sécurité & Permissions

L'extension applique le principe du moindre privilège :

| Permission | Justification |
|---|---|
| `storage` | Sauvegarde locale des clés d'API OVH et de l'historique dans `browser.storage.local`. |
| `contextMenus` | Ajout de l'entrée « Générer & insérer alias » lors d'un clic droit sur un champ de formulaire. |
| `activeTab` & `scripting` | Injection sécurisée de l'adresse générée dans l'élément focalisé de l'onglet actif. |
| `clipboardWrite` | Copie instantanée de l'alias dans le presse-papier lors de la génération. |
| Hôtes `eu.api.ovh.com` / `ca.api.ovh.com` | Communication directe et chiffrée (HTTPS) avec les endpoints officiels d'OVHcloud. |

- **Aucune donnée collectée :** Conformément à la directive Mozilla, `data_collection_permissions: { required: ["none"] }` est déclaré dans le manifest.
- **Signatures SHA-1 locales :** Le protocole d'authentification OVH REST v1 est exécuté exclusivement en local via l'API Web Cryptography du navigateur. L'Application Secret n'est jamais transmis en clair sur le réseau.

---

## 🚀 Build Multi-Navigateurs & Installation manuelle

L'extension supporte nativement **Mozilla Firefox** et **Google Chrome / Chromium** (Brave, Edge, Opera, etc.) depuis une base de code unique.

Pour installer via les stores officiels, privilégiez [Firefox Add-ons](https://addons.mozilla.org/addon/ovh-email-shield/) ou le [Chrome Web Store](https://chromewebstore.google.com/detail/ovh-email-shield/mceniipefgoijaplocajlmihcpecaldg). Pour un usage développeur ou hors-store :

### 1. Construire les paquets
```bash
# Générer les distributions Firefox et Chrome
npm run build

# Ou cibler un navigateur spécifique
npm run build:firefox   # Génère dist/firefox/ et dist/ovh-email-shield-firefox-vX.X.X.zip
npm run build:chrome    # Génère dist/chrome/ et dist/ovh-email-shield-chrome-vX.X.X.zip
```

### 2. Installer dans Firefox
1. Ouvrez `about:debugging#/runtime/this-firefox`.
2. Cliquez sur **« Charger un module temporaire... »**.
3. Sélectionnez le fichier `manifest.json` à la racine ou `dist/firefox/manifest.json`.

### 3. Installer dans Google Chrome / Chromium (Brave, Edge, Vivaldi)
1. Ouvrez l'URL `chrome://extensions` (ou `brave://extensions`, `edge://extensions`).
2. Activez le **« Mode développeur »** (en haut à droite).
3. Cliquez sur **« Charger l'extension non empaquetée »** (*Load unpacked*).
4. Sélectionnez le dossier `dist/chrome/`.

---

## 📂 Architecture du Projet

Structure Vanilla ES Modules sans bundling complexe :

```text
├── manifest.json              # Configuration Manifest V3 Firefox (default_locale: en)
├── _locales/                  # Catalogues de traduction i18n
│   ├── en/messages.json       # Anglais (langue par défaut)
│   └── fr/messages.json       # Français
├── icons/                     # Icônes vectorielles du bouclier
│   └── icon.svg
├── src/
│   ├── background/
│   │   └── background.js      # Service worker, menu contextuel, broker API
│   ├── content/
│   │   └── content.js         # Script d'injection DOM et toasts in-page
│   ├── popup/
│   │   ├── popup.html         # Interface utilisateur popup
│   │   ├── popup.css          # Design sombre soigné
│   │   └── popup.js           # Génération, copie, gestion d'historique
│   ├── options/
│   │   ├── options.html       # Page de configuration des identifiants OVH
│   │   ├── options.css
│   │   └── options.js         # Test de connexion et sauvegarde
│   └── lib/
│       ├── i18n.js            # Helper d'internationalisation et auto-traduction DOM
│       ├── ovh.js             # Client API OVH (signatures HMAC SHA-1, endpoints)
│       ├── alias.js           # Générateur de suffixes aléatoires et formateur
│       ├── dom-autofill.js    # Utilitaires d'injection DOM compatibles React/Vue
│       └── storage.js         # Couche d'accès asynchrone à browser.storage.local
├── tests/                     # Suite de tests unitaires native Node.js
│   ├── i18n.test.js
│   ├── ovh.test.js
│   ├── storage.test.js
│   ├── alias.test.js
│   └── autofill.test.js
├── USER_GUIDE.md              # Mode d'emploi pas-à-pas pour l'utilisateur final
├── LICENSE                    # Licence Mozilla Public License 2.0
└── package.json
```

---

## 🌍 Internationalisation (i18n) & Traduction

Le projet utilise l'API standard WebExtensions `i18n`. L'**anglais** est la langue par défaut (`default_locale: "en"`) et une version **française** complète est intégrée (`_locales/fr/`).

### Ajouter une nouvelle langue
1. Dupliquez le dossier `_locales/en/` vers `_locales/<code_iso>/` (par exemple `_locales/es/` pour l'espagnol, `_locales/de/` pour l'allemand).
2. Traduisez les valeurs `"message"` dans le nouveau fichier `messages.json`.
3. Lancez `npm test` : la suite vérifie automatiquement la complétude des clés et la conformité du catalogue.

---

## 🧪 Tests

Les tests unitaires utilisent le runner de test natif de Node.js (sans dépendances tierces lourdes type Jest) :

```bash
npm test
```

Résultats :
- ✅ **Alias Generator :** formatage, entropie, suffixes aléatoires, gestion des tags de site `[site]`.
- ✅ **DOM Autofill :** injection réactive, prototype setter, `contenteditable`.
- ✅ **OvhClient :** calcul de signature SHA-1, delta d'horloge `/auth/time`, gestion des erreurs HTTP, requêtes GET/POST/DELETE avec repli dynamique d'identifiant.
- ✅ **Storage Helpers :** lecture, écriture, historique plafonné à 50 entrées, mise à jour de statut, suppression ciblée.

---

## 🤖 Transparence & Développement (AI-Assisted)

Par souci de transparence envers la communauté et les éventuels contributeurs :

Ce projet a été conçu, architecturé et développé avec l'assistance de **Google Gemini** (via Gemini CLI).

L'ensemble du code répond aux principes d'ingénierie suivants :
- **Architecture 100 % native :** Vanilla ES Modules sans bundling opaque, utilisation de l'API standard Web Cryptography native pour les signatures SHA-1.
- **Rigueur & Couverture de tests :** Chaque composant critique (calcul des signatures OVH, synchronisation du drift d'horloge, génération anti-collision, injection réactive dans les formulaires et suppression résiliente) est couvert par une suite de **34 tests unitaires automatisés** exécutables directement avec `node --test`.
- **Audit de sécurité :** Zéro télémétrie, aucune transmission de secrets ou de données vers des serveurs tiers.

Les contributions humaines, retours d'expérience, revues de code et signalements de bugs sont chaleureusement bienvenus via les *Issues* et *Pull Requests* !

---

## 🔒 Sécurité, Permissions & Revue Mozilla AMO

Cette extension applique le principe de moindre privilège et a fait l'objet d'un audit de sécurité approfondi (chiffrage, confinement IPC, isolation Shadow DOM).

| Permission | Portée | Justification technique obligatoire (Revue AMO) |
|---|---|---|
| `<all_urls>` (Content Script) | Pages web (`document_idle`) | Nécessaire pour écouter les événements `focusin` et `contextmenu` sur les champs `<input>`, `<textarea>` et `contenteditable`. Permet au menu contextuel de cibler avec exactitude le champ cliqué par l'utilisateur pour y injecter l'alias généré. |
| `activeTab` | Onglet actif | Permet à la popup et au menu contextuel d'accéder à l'URL de l'onglet actif (pour dériver le tag `[site]`) et d'autoriser l'injection dans la page ciblée sans permission permanente d'accès aux onglets. |
| `scripting` | Onglet actif | Utilisé comme mécanisme de secours pour insérer l'alias dans les onglets ouverts avant le chargement ou la mise à jour de l'extension. |
| `storage` | Profil local (`browser.storage.local`) | Stockage local et déconnecté des identifiants API OVH et de l'historique des 50 derniers alias. **Aucune synchronisation distante** via `browser.storage.sync` (zéro fuite vers les serveurs Firefox Sync). |
| `contextMenus` | Menu contextuel | Ajoute l'entrée « OVH Email Shield : générer un alias email » sur les champs éditables de formulaire. |
| `clipboardWrite` | Presse-papier | Permet la copie immédiate de l'alias dans le presse-papier lors de la génération. |
| `https://*.api.ovh.com/*` | API OVHcloud | Strictement restreint aux points de terminaison officiels `eu.api.ovh.com` et `ca.api.ovh.com`. Zéro communication vers d'autres serveurs. |

**Confinement & Durcissement :**
- Les notifications in-page (toasts) sont encapsulées dans un **Shadow DOM fermé** (`attachShadow({ mode: 'closed' })`), rendant le message d'erreur ou de confirmation totalement invisible et inaccessible aux scripts de la page visitée.
- L'écouteur IPC d'arrière-plan rejette systématiquement les requêtes `GENERATE_ALIAS` provenant des scripts d'onglets (`sender.tab`).
- Les accès au stockage local sont sérialisés via un verrou asynchrone pour empêcher les collisions lors d'actions concurrentes.

---

## 📄 Licence

Distribué sous licence **Mozilla Public License 2.0 (MPL-2.0)**. Consultez le fichier [LICENSE](./LICENSE) pour les termes complets.
