<div align="center">
  <img src="icons/icon.svg" alt="OVH Email Shield Logo" width="96" height="96">
  <h1>OVH Email Shield</h1>
  <p><strong>Extension Firefox pour générer des alias emails jetables via votre propre domaine OVHcloud.</strong></p>

  <p>
    <a href="https://www.mozilla.org/firefox/"><img src="https://img.shields.io/badge/Firefox-Manifest%20V3-orange?logo=firefox" alt="Firefox MV3"></a>
    <a href="./tests/"><img src="https://img.shields.io/badge/tests-34%20passing-brightgreen?logo=node.js" alt="Tests"></a>
    <a href="./USER_GUIDE.md"><img src="https://img.shields.io/badge/documentation-Mode%20d'emploi-blue" alt="Mode d'emploi"></a>
    <img src="https://img.shields.io/badge/télémétrie-zéro-success" alt="Zéro télémétrie">
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

### Option A : Charger temporairement dans Firefox (sans installation globale)
1. Téléchargez ou clonez ce dépôt :
   ```bash
   git clone https://github.com/khena/ovh-email-shield-firefox.git
   cd ovh-email-shield-firefox
   ```
2. Dans Firefox, ouvrez `about:debugging#/runtime/this-firefox`.
3. Cliquez sur **« Charger un module temporaire... »**.
4. Sélectionnez le fichier `manifest.json` à la racine du projet.
5. L'icône de bouclier apparaît dans votre barre d'outils !

### Option B : Environnement Développeur (Hot Reload)
```bash
# 1. Cloner et installer les dépendances
npm install

# 2. Lancer Firefox avec rechargement automatique
npm start

# 3. Lancer la suite de tests unitaires
npm test

# 4. Vérifier la conformité du code et du manifest
npm run lint

# 5. Compiler l'archive de production (.zip distribuable)
npm run build
```

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

## 📂 Architecture du Projet

Structure Vanilla ES Modules sans bundling complexe :

```text
├── manifest.json              # Configuration Manifest V3 Firefox
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
│       ├── ovh.js             # Client API OVH (signatures HMAC SHA-1, endpoints)
│       ├── alias.js           # Générateur de suffixes aléatoires et formateur
│       ├── dom-autofill.js    # Utilitaires d'injection DOM compatibles React/Vue
│       └── storage.js         # Couche d'accès asynchrone à browser.storage.local
├── tests/                     # Suite de tests unitaires native Node.js (27 tests)
│   ├── ovh.test.js
│   ├── storage.test.js
│   ├── alias.test.js
│   └── autofill.test.js
├── conductor/                 # Suivi de spécifications et pistes de développement
├── USER_GUIDE.md              # Mode d'emploi pas-à-pas pour l'utilisateur final
└── package.json
```

---

## 🧪 Tests

Les tests unitaires utilisent le runner de test natif de Node.js (sans dépendances tierces lourdes type Jest) :

```bash
npm test
```

Résultats :
- ✅ **Alias Generator :** formatage, entropie, suffixes aléatoires.
- ✅ **DOM Autofill :** injection réactive, prototype setter, `contenteditable`.
- ✅ **OvhClient :** calcul de signature SHA-1, delta d'horloge `/auth/time`, gestion des erreurs HTTP, requêtes GET/POST/DELETE.
- ✅ **Storage Helpers :** lecture, écriture, historique plafonné à 50 entrées, suppression ciblée.

---

## 📄 Licence

Distribué sous licence **Mozilla Public License 2.0 (MPL-2.0)**. Consultez le fichier [LICENSE](./LICENSE) pour les termes complets.
