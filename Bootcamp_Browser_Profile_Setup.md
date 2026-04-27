# Training Tenant Access: Browser Profile Setup Guide

Your organization may block sign-in to tenants other than your work tenant. To access the training environment, you **must** use a browser profile that is **not signed into your work account**. Follow the steps below.

---

## Option 1: Create a New Edge Profile *(Recommended)*

A separate profile keeps your training session alive across browser restarts and won't interfere with your work profile.

### Step 1: Create the profile

1. Open **Microsoft Edge**.
2. Click your **profile icon** in the top-right corner of the browser.
3. Click **Set up a new profile** (at the bottom of the profile flyout).
4. When prompted to choose a profile type, click **Work or school**. (Do **not** choose Personal — the training tenant is an organizational account.)
5. Click **Start without your data**.
6. Click **Confirm and start browsing**.
7. **Do NOT sign in** with any account. Skip or dismiss any sign-in prompts.

> 📖 **Official docs:** [Sign in and create multiple profiles in Microsoft Edge](https://support.microsoft.com/en-us/topic/sign-in-and-create-multiple-profiles-in-microsoft-edge-df94e622-2061-49ae-ad1d-6f0e43ce6435)

### Step 2: Confirm you are NOT signed in

Before navigating to the training tenant, verify the profile is clean:

1. In your **new profile window**, click the **profile icon** in the top-right corner.
2. It should show **"Sign in to sync data"** or a generic person silhouette — **not** your name or work email.
3. Navigate to `edge://settings/profiles` and confirm no account is listed under **"Microsoft account"** or **"Work or school account"**.
4. As a final check, go to [**portal.microsoft.com**](https://portal.microsoft.com). You should see a generic sign-in page — **not** be auto-signed-in to your work tenant.

If you see your work identity anywhere, you are in the wrong profile. Switch to the new profile you just created.

### Step 3: Get your training account and access the labs

1. In your **new, unsigned-in profile**, go to [**Microsoft Copilot Studio Training**](https://aka.ms/MCSWorkshopAgent/) and chat with the training agent to get an account.
2. Use the **code provided by your instructor** when prompted.
3. The agent will provide you with training credentials (username and password).
4. Go to [**portal.microsoft.com**](https://portal.microsoft.com) and log in using the credentials provided by the agent.
5. Go to the [**Architecture Bootcamp — Microsoft Copilot Agents Labs**](https://aka.ms/MCSWorkshopAgent/) to access the labs. **Make sure you are in the labs specific to your bootcamp.**

---

## Option 2: InPrivate Browsing in Edge *(Fallback)*

> ⚠️ **Warning:** InPrivate sessions do not persist. If you **close the InPrivate window**, you will be **immediately signed out** of the training tenant and will need to sign in again. All tabs, session state, and unsaved work in the browser will be lost. Use this only if you cannot create a new profile.

1. Open **Microsoft Edge**.
2. Press **Ctrl + Shift + N**, or click **Settings and more (⋯)** → **New InPrivate window**.
3. A dark-themed window opens with the **"InPrivate"** label visible in the top-left corner.
4. Navigate to the training tenant URL and sign in with your **training credentials**.
5. **Do not close this window** for the duration of the training session.

> 📖 **Official docs:** [Browse InPrivate in Microsoft Edge](https://support.microsoft.com/en-us/microsoft-edge/browse-inprivate-in-microsoft-edge-e6f47704-340c-7d4f-b00d-d0cf35aa1fcc)

---

## Other Browsers — Profile Setup Guides

If you are not using Microsoft Edge, use these official guides to create a separate browser profile:

| Browser | Guide |
| --- | --- |
| **Google Chrome** | [Create Chrome browser profiles](https://support.google.com/chrome/answer/2364824) |
| **Mozilla Firefox** | [Profile Manager — Create, remove, or switch Firefox profiles](https://support.mozilla.org/en-US/kb/profile-manager-create-remove-switch-firefox-profiles) |

The same principle applies: create a new profile, **do not sign in** with your work account, then navigate to the training tenant URL.

---

## Quick Reference

| Method | Persistence | Recommended? |
| --- | --- | --- |
| **New Edge Profile** | ✅ Survives browser restarts | ✅ **Yes** |
| **InPrivate Browsing** | ❌ Lost when window closes | ⚠️ Fallback only |
