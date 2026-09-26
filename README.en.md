<div align="center">
  <img src="icons/icon.svg" alt="OVH Email Shield Logo" width="96" height="96">
  <h1>OVH Email Shield</h1>
  <p><strong>Firefox WebExtension to instantly generate disposable email aliases on your own OVHcloud domain.</strong></p>

  <p>
    <a href="./README.md">🇫🇷 Version française</a> • <strong>🇬🇧 English version</strong>
  </p>

  <p>
    <a href="https://www.mozilla.org/firefox/"><img src="https://img.shields.io/badge/Firefox-Manifest%20V3-orange?logo=firefox" alt="Firefox MV3"></a>
    <a href="./tests/"><img src="https://img.shields.io/badge/tests-34%20passing-brightgreen?logo=node.js" alt="Tests"></a>
    <a href="./USER_GUIDE.en.md"><img src="https://img.shields.io/badge/documentation-User%20Guide-blue" alt="User Guide"></a>
    <img src="https://img.shields.io/badge/telemetry-zero-success" alt="Zero Telemetry">
    <img src="https://img.shields.io/badge/developed%20with-Google%20Gemini-8e44ad?logo=google" alt="Developed with Google Gemini">
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MPL--2.0-blue.svg" alt="License"></a>
  </p>
</div>

---

## 💡 The Problem & The Solution

Every time you share your real email address online, you risk:
- Being tracked and sold to data brokers.
- Inundation with unwanted spam with no real unsubscribe option.
- Having your credentials leaked in third-party data breaches.

**OVH Email Shield** turns your own domain hosted on OVHcloud into a **sovereign anti-spam shield**. With a single click (or via right-click), the extension generates a unique random alias (e.g., `shield.amazon-x8m2q9@yourdomain.com`) and automatically sets up forwarding to your primary inbox.

> **Why choose OVH Email Shield over third-party alias services (SimpleLogin, Firefox Relay, DuckDuckGo)?**
> - **Full Sovereignty:** Your aliases live on *your* own custom domain name.
> - **Free & Unlimited:** Included with the free MX Plan provided with any OVHcloud domain.
> - **Zero Intermediaries:** No third-party relay servers ever read, forward, or inspect your emails. Forwarding happens directly within OVH's native mail infrastructure.

---

## ⚠️ Important Warnings & Use Cases

Before using this extension, please review the following recommendations:

- 🔑 **A Password Manager is Essential:** Because every generated alias is unique and randomized (e.g., `shield.amazon-x8m2q9@yourdomain.com`), this extension **is only practical if you use a password manager** (Bitwarden, 1Password, KeePass, Proton Pass, etc.) to store the generated alias as your account username. Without one, you will inevitably lose track of which email was used for which account.
- 🛠️ **Forwarding Creation Only (Not a Full Mail Manager):** The extension is purpose-built to **rapidly create forwarding rules** during daily browsing (with recent history and quick revocation). It is not a complete email administration dashboard: to modify destination addresses, audit all domain aliases, or inspect MX quotas, you must use the official **OVHcloud Manager**.
- 💰 **Cost Effectiveness:** If you do **not already own** a domain name hosted at OVHcloud, do not purchase one solely for this extension! Annual domain registration fees are not cost-effective for this single purpose compared to dedicated turn-key alias services (such as SimpleLogin, Addy.io, or Proton Pass).
- 🏰 **Philosophy: Data Sovereignty & Independence:** This tool is designed for users who already maintain domains on OVHcloud and wish to **retain absolute ownership over their data**, without relying on external relay platforms.

---

## ✨ Features

- ⚡ **Optimistic Injection (0 ms delay):** Instant local alias generation with anti-collision checks, clipboard copy, and in-page form autofill without waiting for OVH API round-trip latency.
- 🛡️ **1-Click Generation:** Generate a new alias instantly from the toolbar popup.
- ⚡ **Right-Click Autofill:** Context menu entry on editable fields (`input`, `textarea`, `contenteditable`) compatible with reactive frameworks (React, Vue, Angular, Svelte, and Vanilla DOM).
- 📋 **Automatic Clipboard Copy:** Newly generated aliases are automatically copied to your clipboard with visual feedback.
- 🗂️ **History & Revocation:** Browse the last 50 generated aliases and revoke (delete) any forwarding rule on OVH with a single click on the trash icon.
- 🌐 **Automatic Website Identification:** Automatically detects the current website and embeds it in the alias (e.g., `shield.amazon-x8m2@yourdomain.com`) when `[site]` is included in your pattern.
- 🎨 **100% Customizable Format:** Freely combine `[site]` and `[rand]` in options (e.g., `shield.[site]-[rand]`, or simply `shield-[rand]` to omit the website name).
- ⏱️ **Server Time Synchronization:** Automatic clock drift adjustment against `/auth/time` on OVH servers to eliminate signature expiration errors.
- 🔒 **Absolute Privacy:** Zero third-party servers, zero analytics, zero telemetry. All credentials and history are encrypted locally inside your Firefox profile.

---

## 📖 User Guide

For a step-by-step tutorial (creating your OVH API keys, configuring minimal REST permissions, troubleshooting), see:

👉 **[Read the Full User Guide (USER_GUIDE.en.md)](./USER_GUIDE.en.md)**

---

## 🚀 Installation & Usage

### Option A: Temporary Add-on Load in Firefox (No build needed)
1. Clone or download this repository:
   ```bash
   git clone https://github.com/khena/ovh-email-shield-firefox.git
   cd ovh-email-shield-firefox
   ```
2. In Firefox, navigate to `about:debugging#/runtime/this-firefox`.
3. Click on **"Load Temporary Add-on..."**.
4. Select the `manifest.json` file in the project root directory.
5. The shield icon will appear in your Firefox toolbar!

### Option B: Developer Workflow (Hot Reload)
```bash
# 1. Install dev tooling
npm install

# 2. Launch Firefox with automatic extension reload
npm start

# 3. Run the automated test suite
npm test

# 4. Check manifest and code compliance
npm run lint

# 5. Build production zip archive
npm run build
```

---

## 🔒 Security & Permissions

The extension strictly adheres to the principle of least privilege:

| Permission | Justification |
|---|---|
| `storage` | Local storage of OVH API credentials and alias history in `browser.storage.local`. |
| `contextMenus` | Adds the "Generate & insert email alias" option when right-clicking editable fields. |
| `activeTab` & `scripting` | Securely injects the generated email into the focused field on the active tab. |
| `clipboardWrite` | Instantly copies the created alias to your clipboard upon generation. |
| Hosts `eu.api.ovh.com` / `ca.api.ovh.com` | Direct and encrypted HTTPS communication with official OVHcloud REST endpoints. |

- **Zero Data Collection:** Declares `data_collection_permissions: { required: ["none"] }` in compliance with Mozilla policies.
- **Local SHA-1 Signatures:** The OVH REST v1 authentication protocol is computed entirely in-memory via the browser's native Web Cryptography API. Your Application Secret is never sent over the wire.

---

## 📂 Project Structure

Clean Vanilla ES Modules structure without bundlers:

```text
├── manifest.json              # Firefox Manifest V3 configuration
├── icons/                     # Vector SVG shield icons
│   └── icon.svg
├── src/
│   ├── background/
│   │   └── background.js      # Service worker, context menu, async API broker
│   ├── content/
│   │   └── content.js         # DOM injection script and in-page notifications
│   ├── popup/
│   │   ├── popup.html         # Toolbar popup interface
│   │   ├── popup.css          # Sleek dark theme stylesheet
│   │   └── popup.js           # Generation, copy, and history view controller
│   ├── options/
│   │   ├── options.html       # OVH credentials settings page
│   │   ├── options.css
│   │   └── options.js         # Connection test and config persistence
│   └── lib/
│       ├── ovh.js             # OVH REST client (HMAC SHA-1 signing, endpoints)
│       ├── alias.js           # Random suffix generator and pattern formatter
│       ├── dom-autofill.js    # Reactive DOM injection helpers (React/Vue/etc.)
│       └── storage.js         # Storage wrapper for browser.storage.local
├── tests/                     # Automated unit test suite (34 tests)
│   ├── ovh.test.js
│   ├── storage.test.js
│   ├── alias.test.js
│   └── autofill.test.js
├── USER_GUIDE.md              # French user guide
├── USER_GUIDE.en.md           # English user guide
├── LICENSE                    # Mozilla Public License 2.0
└── package.json
```

---

## 🧪 Tests

Unit tests execute via the native Node.js test runner (`node --test`), with zero heavy third-party testing dependencies:

```bash
npm test
```

Coverage:
- ✅ **Alias Generator:** formatting, entropy, random suffixes, `[site]` tags.
- ✅ **DOM Autofill:** reactive framework input injection, prototype setters, `contenteditable`.
- ✅ **OvhClient:** SHA-1 signature generation, `/auth/time` clock synchronization, HTTP error formatting, GET/POST/DELETE requests with dynamic ID lookup.
- ✅ **Storage Helpers:** config read/write, 50-item capped history, status updates, targeted deletion.

---

## 🤖 AI-Assisted Development Transparency

In the interest of honesty and transparency towards the open-source community:

This project was initially designed, architected, and developed with the assistance of **Google Gemini** (via Gemini CLI).

All code complies with the following software engineering standards:
- **100% Native Architecture:** Vanilla ES Modules with zero bundling obfuscation; native Web Cryptography API for HMAC-SHA1 signatures.
- **Rigor & Test Coverage:** All critical logic (OVH signatures, clock drift sync, anti-collision generation, reactive form injection, resilient deletion) is backed by an automated suite of **34 unit tests**.
- **Security Auditing:** Zero telemetry, no third-party network requests, credentials stored strictly in local profile storage.

Human contributions, code reviews, feature suggestions, and bug reports are warmly welcome via GitHub *Issues* and *Pull Requests*!

---

## 📄 License

Distributed under the **Mozilla Public License 2.0 (MPL-2.0)**. See the [LICENSE](./LICENSE) file for the full license text.
