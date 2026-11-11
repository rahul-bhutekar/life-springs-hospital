# Connect the website to Google Sheets

The website saves appointment requests, assistant bookings and unanswered assistant questions to a Google
Sheet, and the admin board (`/admin`) reads them back. A small Google Apps Script attached to the Sheet
sits in between. Setup takes about 10 minutes and needs no coding.

Until this is done the site runs in **demo mode**: forms show a confirmation but nothing is saved, and the
admin board shows sample data.

## 1. Create the Sheet

1. Sign in to the Google account the hospital will own the data with.
2. Create a blank spreadsheet at <https://sheets.new> and name it, for example, **Life Springs enquiries**.

You don't need to add any columns. The script creates the **Enquiries** and **Questions** tabs the first
time a request arrives.

## 2. Add the script

1. In the Sheet, open **Extensions → Apps Script**.
2. Delete everything in `Code.gs` and paste in the contents of [`apps-script/Code.gs`](../apps-script/Code.gs).
3. Click **Save**.
4. Open **Project Settings** (the gear icon on the left):
   - Set **Time zone** to **(GMT+05:30) India Standard Time**.
   - Under **Script properties**, click **Add script property**. Set **Property** to `ADMIN_PASSCODE`
     and **Value** to the passcode your staff will use to open the admin board. Use at least 12
     characters that are hard to guess. Click **Save script properties**.

## 3. Publish it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear next to **Select type** and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone. This lets patients without a Google account send requests. They can only
     add requests; reading them needs the passcode.
4. Click **Deploy**, then **Authorize access** and choose your account.
   Google warns that the app isn't verified because it's your own new script. Click **Advanced → Go to …
   (unsafe)** and **Allow**.
5. Copy the **Web app URL**. It ends in `/exec`.

To check it works, open that URL in your browser. You should see `{"ok":true,"service":"life-springs-enquiries"}`.

## 4. Connect the website

The website reads the URL from the `VITE_SHEETS_URL` setting when it is built.

**On your computer:** create a file named `.env.local` in the project folder containing:

```
VITE_SHEETS_URL=https://script.google.com/macros/s/…/exec
```

Then restart `npm run dev`. `.env.local` is not committed to git.

**On your hosting service** (Vercel, Netlify, etc.): add an environment variable named `VITE_SHEETS_URL`
with the same value, and redeploy.

Then try it:

1. Send a request from `/appointment`. A new row appears in the **Enquiries** tab with status **New**.
2. Open `/admin` and sign in with your passcode. You should see the request there.

## Updating the script later

After editing `Code.gs`, use **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.
This keeps the same URL, so the website doesn't need changing.

## What's protected, and the limits

- **The Sheet stays private** to your Google account. Share it only with staff who need it.
- **Anyone can send a request**, as on any contact form. The script ignores bots that fill a hidden field,
  allows 3 requests per phone number every 10 minutes, and stops text from running as a spreadsheet formula.
- **The admin board needs the passcode.** After 10 wrong attempts it locks for 10 minutes. You stay signed in
  until you close the tab, sign out, or leave it idle for 30 minutes.
- **Everyone shares one passcode**, and there's no two-step sign-in. If someone leaves, change
  `ADMIN_PASSCODE` in Script properties. Moving to Supabase later gives each person their own sign-in.
- **Patient data:** names and phone numbers are personal data under India's DPDP Act 2023. Keep the Sheet
  shared only with staff, and delete rows you no longer need.

## Moving to Supabase later

All of the website's backend calls are in [`src/lib/api.ts`](../src/lib/api.ts). Moving to Supabase means
rewriting that file (and exporting the Sheet's rows into a Supabase table); the pages don't change.
