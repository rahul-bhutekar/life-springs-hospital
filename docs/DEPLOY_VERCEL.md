# Publish the website on Vercel

Vercel builds the site from GitHub and publishes it. After the first setup, every merge to `main`
updates the live site automatically, and every pull request gets its own preview link.

`vercel.json` in this repo already tells Vercel how to build the site and makes links such as
`/doctor` and `/admin` work when opened directly.

## 1. Import the repository

1. Sign in at <https://vercel.com> with your GitHub account.
2. Click **Add New… → Project**, find **life-springs-hospital** and click **Import**.
   If it isn't listed, click **Adjust GitHub App Permissions** and give Vercel access to the repository.
3. Leave **Framework Preset** as **Vite** and the build settings as they are.

## 2. Add the Google Sheets link

Vercel needs its own copy of the setting. **A variable saved in GitHub is not passed to Vercel.**

1. On the same screen, open **Environment Variables**.
2. Add **Key** `VITE_SHEETS_URL` with your Apps Script **Web app URL** (ending in `/exec`).
   Leave all environments (Production, Preview, Development) ticked.
3. Click **Deploy**.

If you add or change the variable after the first deploy, go to **Deployments**, open the latest one and
click **Redeploy**: the link is built into the site, so it only takes effect after a new build.

## 3. Check it

Open the site address Vercel gives you (for example `life-springs-hospital.vercel.app`) and:

1. Send a test request from **Request an appointment**. It should appear in the Sheet's **Enquiries** tab.
2. Open `/admin`. You should see the passcode sign-in (not "Demo data"). Sign in and check the request.

If `/admin` shows "Demo data", the variable wasn't there when the site was built: add it and redeploy.

## 4. Use the hospital's own domain (optional)

In the project, open **Settings → Domains**, add your domain (for example `lifespringshospital.in`) and
follow the DNS steps Vercel shows. HTTPS is set up automatically.
