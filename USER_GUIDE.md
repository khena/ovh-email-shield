# 📖 Mode d'emploi - OVH Email Shield

Guide complet d'installation, de configuration et d'utilisation pour l'extension Firefox **OVH Email Shield**.

<p align="center">
  <strong>🇫🇷 Version française</strong> • <a href="./USER_GUIDE.en.md">🇬🇧 English version</a>
</p>

---

## Sommaire
1. [À quoi sert l'extension ?](#1-à-quoi-sert-lextension-)
2. [Avertissements importants & Cas d'usage](#2-avertissements-importants--cas-dusage)
3. [Prérequis nécessaires chez OVH](#3-prérequis-nécessaires-chez-ovh)
4. [Générer vos clés API OVH (Pas-à-pas)](#4-générer-vos-clés-api-ovh-pas-à-pas)
5. [Configurer l'extension](#5-configurer-lextension)
6. [Utilisation au quotidien](#6-utilisation-au-quotidien)
   - [Méthode 1 : Clic droit dans un champ de formulaire (Recommandé)](#méthode-1--clic-droit-dans-un-champ-de-formulaire-recommandé)
   - [Méthode 2 : Depuis la popup de la barre d'outils](#méthode-2--depuis-la-popup-de-la-barre-doutils)
   - [Personnalisation du préfixe des alias](#personnalisation-du-préfixe-des-alias)
   - [Supprimer une redirection](#supprimer-une-redirection)
7. [Foire Aux Questions & Dépannage (FAQ)](#7-foire-aux-questions--dépannage-faq)
8. [Sécurité et Respect de la vie privée](#8-sécurité-et-respect-de-la-vie-privée)

---

## 1. À quoi sert l'extension ?

Lorsque vous vous inscrivez sur un site web (e-commerce, newsletter, forum), donner votre véritable adresse email vous expose aux risques de fuites de données, de spam et de profilage publicitaire.

**OVH Email Shield** utilise votre propre nom de domaine hébergé chez OVHcloud pour générer instantanément des adresses emails jetables ou dédiées (ex: `shield-7k2x9m@mondomaine.fr`) et configure automatiquement la redirection vers votre boîte personnelle.

- Si un service commence à vous spammer ou est compromis : **supprimez la redirection en 1 clic**, vos autres communications restent intactes.
- Vous restez **100 % propriétaire** de vos données et de votre infrastructure email (aucun service tiers payant intermédiaire comme SimpleLogin ou Firefox Relay).

---

## 2. Avertissements importants & Cas d'usage

Avant d'utiliser cette solution, veillez à bien comprendre son fonctionnement et ses limites :

- 🔑 **Indispensable : avoir un gestionnaire de mots de passe**  
  Chaque alias créé est unique, aléatoire et spécifique au site consulté (ex: `shield-x8m2q9@mondomaine.fr`). Cette extension **n'est intéressante que si vous utilisez un gestionnaire de mots de passe** (Bitwarden, 1Password, KeePass, Proton Pass, etc.) capable d'enregistrer l'adresse comme identifiant de votre compte. Sans gestionnaire, vous oublierez inévitablement quel email vous avez utilisé pour quel service.

- 🛠️ **Création de redirections uniquement, pas de gestion complète**  
  L'extension a pour unique rôle d'accélérer la création de redirections au fil de votre navigation quotidienne et de proposer un historique rapide des derniers ajouts. Pour toute opération avancée (modifier l'adresse de destination d'un alias, auditer la liste exhaustive de vos redirections, gérer vos quotas MX ou vos comptes mails), **vous devez obligatoirement passer par l'Espace Client OVHcloud Manager**.

- 💰 **Pertinence tarifaire**  
  Si vous ne possédez **pas déjà un nom de domaine chez OVHcloud**, ne souscrivez pas à un abonnement de domaine spécifiquement pour ce plugin ! Les frais d'enregistrement annuels d'un domaine ne seront pas rentables par rapport au besoin : il vous coûtera bien moins cher et sera plus simple d'adopter une solution clé en main prête à l'emploi (telle que SimpleLogin, Addy.io, Proton Pass ou Firefox Relay).

- 🏰 **Philosophie : Contrôle des données & Zéro dépendance tierce**  
  Ce plugin est conçu exclusivement pour les personnes souhaitant **garder le contrôle total sur leurs données** et ne pas être dépendantes d'un service intermédiaire en dehors de leur hébergeur OVHcloud. Aucun serveur tiers n'intercepte, ne relaie ou n'analyse vos courriels.

---

## 3. Prérequis nécessaires chez OVH

Pour faire fonctionner l'extension, vous devez disposer de :
- Un compte client **OVHcloud**.
- Au moins un **nom de domaine actif** géré sur votre compte OVH (ex: `mondomaine.fr`).
- Une offre email active sur ce domaine (l'offre gratuite **MX Plan 1 inclus avec chaque domaine** chez OVH suffit amplement pour créer des redirections illimitées).

---

## 3. Générer vos clés API OVH (Pas-à-pas)

Pour des raisons de sécurité évidentes, ne renseignez jamais le mot de passe de votre compte OVH principal. L'extension utilise des jetons d'accès REST à privilèges réduits.

1. Rendez-vous sur la page officielle de création de token :
   - **Europe / Monde :** [https://eu.api.ovh.com/createToken/](https://eu.api.ovh.com/createToken/)
   - **Canada / USA :** [https://ca.api.ovh.com/createToken/](https://ca.api.ovh.com/createToken/)
2. Connectez-vous avec votre identifiant client OVH (ex: `xx12345-ovh`).
3. Remplissez le formulaire :
   - **Application name :** `Firefox OVH Email Shield`
   - **Application description :** `Génération d'alias et redirections email pour Firefox`
   - **Validity :** Choisissez `Unlimited` pour ne pas avoir à renouveler les clés, ou la durée de votre choix.
4. **Définissez les droits d'accès minimaux (Rights) :**
   Cliquez sur le bouton pour ajouter 4 lignes :

   | Méthode (Method) | URI | Description |
   |---|---|---|
   | `GET` | `/auth/*` | Vérification de la connexion et synchronisation de l'heure |
   | `GET` | `/email/domain/*` | Consultation des redirections existantes |
   | `POST` | `/email/domain/*` | Création de nouvelles redirections d'alias |
   | `DELETE` | `/email/domain/*` | Suppression des redirections |

   *(Optionnel de sécurité supplémentaire : remplacez `*` par votre nom de domaine exact, par exemple `/email/domain/mondomaine.fr/*`)*.

5. Cliquez sur **Generate token** / **Créer les clés**.
6. **IMPORTANT :** Conservez la page ouverte ou copiez immédiatement les trois valeurs affichées :
   - `Application Key` (AK)
   - `Application Secret` (AS)
   - `Consumer Key` (CK)

---

## 4. Configurer l'extension

1. Dans Firefox, cliquez sur l'icône **OVH Email Shield** (icône de bouclier dans la barre d'outils).
2. Cliquez sur le bouton d'engrenage **⚙️** ou sur le lien **Configurer**.
3. Sur la page d'options :
   - **Région :** Sélectionnez `Europe` ou `Canada / USA` selon votre compte.
   - **Application Key :** Collez votre `AK`.
   - **Application Secret :** Collez votre `AS`.
   - **Consumer Key :** Collez votre `CK`.
   - **Domaine OVH :** Saisissez votre domaine (ex: `mondomaine.fr`).
   - **Email de destination :** Saisissez l'adresse réelle qui recevra vos courriels (ex: `mon.nom@gmail.com` ou `moi@orange.fr`).
   - **Modèle de préfixe :** Par défaut `shield-[rand]`.
4. Cliquez sur **Tester la connexion** :
   - Un message vert doit confirmer la validité des clés et l'accès à votre domaine.
5. Cliquez sur **Enregistrer**.

---

## 5. Utilisation au quotidien

### Méthode 1 : Clic droit dans un champ de formulaire (Recommandé)
1. Lors d'une inscription sur un site, faites un clic droit directement dans le champ `Email`.
2. Dans le menu contextuel, cliquez sur **« OVH Email Shield : générer un alias email »**.
3. L'alias est automatiquement généré chez OVH et inséré dans le champ.
4. Une notification discrète en bas à droite de votre écran confirme la création et l'adresse générée.

### Méthode 2 : Depuis la popup de la barre d'outils
1. Cliquez sur l'icône de l'extension dans la barre d'outils.
2. Cliquez sur le bouton bleu **« Générer un alias »**.
3. L'alias apparaît à l'écran et est **automatiquement copié dans votre presse-papier** (prêt pour un `Ctrl+V`).
4. Vous pouvez également cliquer sur **« Insérer dans la page »** pour l'injecter dans le champ actif de l'onglet en cours.

### Personnalisation du préfixe des alias & Contexte du site web
Dans la page des options, vous pouvez personnaliser la composition de vos adresses via le champ **Modèle de préfixe** :
- **Identification automatique du site web :** Par défaut, le modèle est `shield.[site]-[rand]`. L'extension détecte le site sur lequel vous vous trouvez pour l'intégrer dans l'alias (ex: sur `amazon.fr`, l'alias devient `shield.amazon-4x9b2a@mondomaine.fr`). Cela vous permet de savoir immédiatement quel service est concerné dans votre **Espace Client OVH** sans ouvrir l'extension.
- **Désactiver l'affichage du site :** Il vous suffit de retirer la variable `[site]` de votre modèle dans les options (ex: `shield-[rand]`). Vos alias seront alors strictement aléatoires et anonymes (ex: `shield-4x9b2a@mondomaine.fr`).
- **Exemples de modèles supportés :**
  - `shield.[site]-[rand]` ➔ `shield.amazon-4x9b2a@mondomaine.fr` (par défaut)
  - `shield-[site]-[rand]` ➔ `shield-github-8k2m9x@mondomaine.fr`
  - `prive-[rand]` ➔ `prive-7n1x2w@mondomaine.fr` (sans nom de site)

*Note : Si vous générez un alias depuis un onglet interne au navigateur (où aucun site web n'est actif), la variable `[site]` est automatiquement ignorée proprement (ex: `shield-4x9b2a@mondomaine.fr`).*

### Supprimer une redirection
1. Ouvrez la popup de l'extension.
2. Dans la section **Derniers alias créés**, repérez l'adresse à révoquer.
3. Cliquez sur l'icône de corbeille **🗑️**.
4. Confirmez la suppression : la redirection est immédiatement effacée sur les serveurs d'OVHcloud et retirée de votre historique local. Les courriels envoyés à cette adresse seront désormais rejetés.

---

## 6. Foire Aux Questions & Dépannage (FAQ)

### Pourquoi les emails mettent-ils quelques minutes à arriver après création ?
Lors de la création d'une nouvelle redirection sur l'API OVH, un délai de synchronisation interne de 1 à 5 minutes peut être nécessaire pour que l'ensemble des serveurs MX d'OVH propagent la nouvelle règle de routage.

### Erreur : « Invalid signature » lors du test ou de la génération
Les requêtes OVH nécessitent un horodatage précis. L'extension synchronise automatiquement son horloge avec `/auth/time` d'OVH. Si l'erreur persiste :
- Vérifiez que vous n'avez pas inversé `Application Key` et `Application Secret`.
- Assurez-vous que l'heure de votre système d'exploitation n'a pas plusieurs minutes d'écart avec l'heure réelle.

### Erreur : « 403 / This credential is not allowed to access... »
Le token créé sur OVH ne dispose pas des droits suffisants. Retournez sur la section [3. Générer vos clés API](#3-générer-vos-clés-api-ovh-pas-à-pas) et vérifiez que vous avez bien autorisé les méthodes `GET`, `POST` et `DELETE` sur `/email/domain/*`.

### Puis-je répondre à un email reçu sur un alias ?
L'extension configure une redirection entrante : tout email reçu sur l'alias est transféré vers votre adresse réelle. Si vous cliquez sur « Répondre » depuis votre boîte mail, votre client de messagerie utilisera par défaut votre adresse principale. Pour répondre anonymement, il est nécessaire de configurer une identité d'expéditeur (alias d'envoi) dans votre client de messagerie supportant le domaine.

---

## 7. Sécurité, Permissions et Respect de la vie privée

- **100 % Côté Client :** Tout le code tourne localement dans votre navigateur Firefox (Vanilla ES Modules sans intermédiaire).
- **Zéro Télémétrie :** Aucun pistage, aucune collecte de données, aucun appel vers des serveurs d'analyse (`data_collection_permissions: none`).
- **Stockage Local Déconnecté :** Vos clés d'API et votre historique sont uniquement conservés dans le profil local Firefox (`browser.storage.local`). Aucune donnée n'est transmise à Mozilla Sync.
- **Signature Cryptographique SHA-1 :** La formule de signature officielle d'OVH est calculée en mémoire locale via l'API Web Cryptography native du navigateur.
- **Isolation DOM & CSS (Shadow DOM fermé) :** Les notifications (toasts) sont encapsulées dans un Shadow Root fermé inaccessible aux scripts de la page visitée, empêchant toute fuite d'informations ou interférence CSS.
- **Protection Anti-collision & Mutex :** Les mutations du stockage local sont sérialisées via un verrou asynchrone pour éviter tout écrasement lors d'actions concurrentes.
- **Justification des permissions requises :**
  - `<all_urls>` : Permet de mémoriser le dernier champ de formulaire cliqué (`focusin` / `contextmenu`) pour y insérer l'adresse lors d'un clic droit.
  - `activeTab` & `scripting` : Accès ponctuel à l'onglet actif lors du clic droit ou de l'ouverture de la popup pour détecter le nom du site et autoriser l'insertion.
  - `contextMenus` : Ajout du menu contextuel sur les champs éditables.
  - `clipboardWrite` : Copie directe de l'alias généré dans le presse-papier.
  - `https://*.api.ovh.com/*` : Communication chiffrée HTTPS strictement limitée aux API officielles OVHcloud.
