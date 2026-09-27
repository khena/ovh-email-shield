# 📖 User Guide - OVH Email Shield

Complete installation, configuration, and user manual for the **OVH Email Shield** Firefox extension.

<p align="center">
  <a href="./USER_GUIDE.md">🇫🇷 Version française</a> • <strong>🇬🇧 English version</strong>
</p>

---

## Table of Contents
1. [What is this extension for?](#1-what-is-this-extension-for)
2. [Important Warnings & Use Cases](#2-important-warnings--use-cases)
3. [Prerequisites with OVHcloud](#3-prerequisites-with-ovhcloud)
4. [Generating your OVH API Keys (Step-by-Step)](#4-generating-your-ovh-api-keys-step-by-step)
5. [Configuring the Extension](#5-configuring-the-extension)
6. [Daily Usage](#6-daily-usage)
   - [Method 1: Right-click in a form field (Recommended)](#method-1-right-click-in-a-form-field-recommended)
   - [Method 2: From the toolbar popup](#method-2-from-the-toolbar-popup)
   - [Customizing the alias prefix & Website context](#customizing-the-alias-prefix--website-context)
   - [Deleting a redirection](#deleting-a-redirection)
7. [Frequently Asked Questions & Troubleshooting (FAQ)](#7-frequently-asked-questions--troubleshooting-faq)
8. [Security & Privacy Guarantees](#8-security--privacy-guarantees)

---

## 1. What is this extension for?

When you sign up on websites (e-commerce, newsletters, forums), providing your real email address exposes you to risks of data leaks, spam campaigns, and ad profiling.

**OVH Email Shield** uses your own domain name hosted on OVHcloud to instantly generate disposable or dedicated email addresses (e.g., `shield.amazon-7k2x9m@yourdomain.com`) and automatically creates a server-side forwarding rule to your personal inbox.

- If a service starts spamming you or suffers a breach: **delete the redirection with 1 click**, your other accounts remain untouched.
- You remain **100% in control** of your data and email infrastructure (no paid or proprietary third-party relay service such as SimpleLogin or Firefox Relay).

---

## 2. Important Warnings & Use Cases

Before using this extension, make sure to understand its scope and limitations:

- 🔑 **A Password Manager is Essential**  
  Every generated alias is unique, randomized, and site-specific (e.g., `shield.amazon-x8m2q9@yourdomain.com`). This extension **is only practical if you use a password manager** (Bitwarden, 1Password, KeePass, Proton Pass, etc.) to record the generated email as your account login. Without one, you will inevitably forget which address belongs to which service.

- 🛠️ **Forwarding Creation Only (Not a Full Mailbox Manager)**  
  The extension is designed exclusively to speed up alias creation while browsing and to provide quick access to recent items. For advanced operations (changing the destination address of an alias, auditing all domain redirections, or managing mailbox quotas), **you must use the official OVHcloud Manager**.

- 💰 **Economic Relevance**  
  If you do **not already own an OVHcloud domain**, do not purchase one solely for this tool! Annual domain registration costs make it more expensive than adopting dedicated turn-key alias services (such as SimpleLogin, Addy.io, or Proton Pass).

- 🏰 **Philosophy: Data Sovereignty & Independence**  
  This project is built for users who already have OVHcloud hosting and want to **retain total ownership over their email flow**, without routing communications through third-party servers.

---

## 3. Prerequisites with OVHcloud

To use the extension, you need:
- An active **OVHcloud account**.
- At least one **active domain name** managed in your OVH account (e.g., `yourdomain.com`).
- An active email offer on that domain (the free **MX Plan 1 included with every domain** at OVH is sufficient for unlimited redirections).

---

## 4. Generating your OVH API Keys (Step-by-Step)

For security, never use your main OVH account password. The extension uses scoped REST API tokens with minimal privileges.

1. Go to the official OVH token creation page:
   - **Europe / World:** [https://eu.api.ovh.com/createToken/](https://eu.api.ovh.com/createToken/)
   - **Canada / USA:** [https://ca.api.ovh.com/createToken/](https://ca.api.ovh.com/createToken/)
2. Log in with your OVH client ID (e.g., `xx12345-ovh`).
3. Fill in the form:
   - **Application name:** `Firefox OVH Email Shield`
   - **Application description:** `Email alias generator and forwarding tool for Firefox`
   - **Validity:** Select `Unlimited` so keys do not expire, or your desired duration.
4. **Define Minimal Access Rights:**
   Click to add the following 4 rules:

   | Method | URI | Description |
   |---|---|---|
   | `GET` | `/auth/*` | Connection validation and server time sync |
   | `GET` | `/email/domain/*` | Read existing redirections |
   | `POST` | `/email/domain/*` | Create new email redirections |
   | `DELETE` | `/email/domain/*` | Delete/revoke redirections |

   *(Optional security restriction: you can replace `*` with your exact domain name, for example `/email/domain/yourdomain.com/*`)*.

5. Click on **Generate token**.
6. **IMPORTANT:** Keep the page open or copy the three generated credentials immediately:
   - `Application Key` (AK)
   - `Application Secret` (AS)
   - `Consumer Key` (CK)

---

## 5. Configuring the Extension

1. In Firefox, click the **OVH Email Shield** icon in your toolbar.
2. Click the gear icon **⚙️** or the **Configure** link.
3. On the options page:
   - **Region:** Select `Europe` or `Canada / USA` depending on your account.
   - **Application Key:** Paste your `AK`.
   - **Application Secret:** Paste your `AS`.
   - **Consumer Key:** Paste your `CK`.
   - **OVH Domain:** Enter your domain name (e.g., `yourdomain.com`).
   - **Destination Email:** Enter the real email address that will receive forwarded messages (e.g., `yourname@gmail.com`).
   - **Prefix Pattern:** Default is `shield.[site]-[rand]`.
4. Click **Test connection**:
   - A green confirmation message indicates your keys are valid and your domain is accessible.
5. Click **Save**.

---

## 6. Daily Usage

### Method 1: Right-click in a form field (Recommended)
1. On any sign-up or registration form, right-click directly inside the `Email` input field.
2. In the context menu, click **"OVH Email Shield : générer un alias email"**.
3. The alias is generated instantly and inserted into the field.
4. A subtle notification in the lower-right corner confirms the address created.

### Method 2: From the toolbar popup
1. Click the extension icon in the toolbar.
2. Click the blue button **"Generate an alias"**.
3. The alias appears and is **automatically copied to your clipboard** (ready for `Ctrl+V`).
4. You can also click **"Insert into page"** to fill the currently focused field on the active tab.

### Customizing the alias prefix & Website context
In the options page, customize your alias format using the **Prefix pattern** field:
- **Automatic website identification:** By default, the pattern is `shield.[site]-[rand]`. The extension identifies the current site and includes it in the alias (e.g., on `amazon.com`, the alias becomes `shield.amazon-4x9b2a@yourdomain.com`). This lets you identify the service directly in the **OVHcloud Manager** without opening the extension.
- **Strictly random / anonymous aliases:** Simply remove `[site]` from your pattern (e.g., `shield-[rand]`). Aliases will be purely randomized (e.g., `shield-4x9b2a@yourdomain.com`).
- **Examples of valid patterns:**
  - `shield.[site]-[rand]` ➔ `shield.amazon-4x9b2a@yourdomain.com` (default)
  - `shield-[site]-[rand]` ➔ `shield-github-8k2m9x@yourdomain.com`
  - `private-[rand]` ➔ `private-7n1x2w@yourdomain.com`

*Note: When generating an alias on an internal browser tab (where no website is loaded), the `[site]` placeholder is automatically omitted cleanly without punctuation artifacts (e.g., `shield-4x9b2a@yourdomain.com`).*

### Deleting a redirection
1. Open the extension popup.
2. In the **Recent aliases** list, locate the address you want to revoke.
3. Click the trash icon **🗑️**.
4. Confirm deletion: the redirection is deleted from OVHcloud servers and removed from your local history. Future emails sent to this alias will bounce.

---

## 7. Frequently Asked Questions & Troubleshooting (FAQ)

### Why do emails take a few minutes to arrive right after creation?
When creating a new redirection via the OVH API, internal MX propagation across OVH servers typically takes between 1 and 5 minutes before all routing rules are active.

### Error: "Invalid signature" during test or generation
OVH API requests require accurate timestamps. The extension automatically calculates clock drift against `/auth/time` on OVH servers. If the error persists:
- Verify that `Application Key` and `Application Secret` are not inverted.
- Ensure your computer's system clock is synchronized with internet time.

### Error: "403 / This credential is not allowed to access..."
The token created on OVH does not have adequate permissions. Review section [4. Generating your OVH API Keys](#4-generating-your-ovh-api-keys-step-by-step) and confirm that `GET`, `POST`, and `DELETE` methods are allowed for `/email/domain/*`.

### Can I reply to an email received on an alias?
The extension sets up inbound forwarding: emails sent to the alias are redirected to your real inbox. Clicking "Reply" in your email client will use your default sender address. To reply anonymously, configure an outbound sender identity (alias) in your email client that supports your domain.

---

## 8. Security, Permissions & Privacy Guarantees

- **100% Client-Side:** All logic executes locally inside your Firefox browser (Vanilla ES Modules without intermediaries).
- **Zero Telemetry:** No analytics, no tracking, no calls to third-party servers (`data_collection_permissions: none`).
- **Offline Local Storage:** API credentials and history stay in your local browser profile (`browser.storage.local`). No data is sent to Mozilla Sync.
- **Native Cryptography:** The official OVH HMAC-SHA1 signature is computed in-memory using the browser's native Web Cryptography API.
- **DOM & CSS Isolation (Closed Shadow DOM):** Notification toasts are encapsulated inside a closed Shadow Root inaccessible to host web page scripts, preventing data leaks or CSS clobbering.
- **Race Condition Prevention & Mutex:** Storage mutations are serialized via an asynchronous promise queue to prevent write collisions under concurrent operations.
- **Technical Rationale for Requested Permissions:**
  - `<all_urls>`: Needed to track the last focused input field (`focusin` / `contextmenu`) so the right-click menu can insert the generated alias into the exact targeted element.
  - `activeTab` & `scripting`: One-time access to the active tab on right-click or popup opening to derive the website name (`[site]`) and authorize form autofill.
  - `contextMenus`: Adds the context menu entry on editable form inputs.
  - `clipboardWrite`: Immediately copies the newly generated alias to your clipboard.
  - `https://*.api.ovh.com/*`: Encrypted HTTPS communication strictly confined to official OVHcloud API endpoints.
