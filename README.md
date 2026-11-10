# Life Springs Maternity Hospital

Patient website, AI enquiry assistant and owner dashboard for Life Springs Maternity Hospital, Pune.
Built with React, TypeScript and Vite.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm test           # run the assistant's conversation tests
```

## Pages

| Route          | What it is                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| `/`            | Home: hero, services, doctor, facilities, stories, visit (mobile + desktop) |
| `/doctor`      | Dr. Deepak Shinde's profile                                                 |
| `/appointment` | Appointment request form with confirmation                                  |
| `/assistant`   | Scripted, hospital-approved enquiry assistant (chat)                        |
| `/admin`       | Owner dashboard: KPIs, enquiries, AI summary, WhatsApp drafts, feedback     |

## Screenshots

| Desktop | Phone |
| --- | --- |
| ![Home, desktop](docs/screenshots/desktop-home.png) | ![Home, phone](docs/screenshots/phone-home.png) |
| ![Dashboard, desktop](docs/screenshots/desktop-dashboard.png) | ![Dashboard, phone](docs/screenshots/phone-dashboard.png) |

More in [`docs/screenshots/`](docs/screenshots/).

## Structure

```
src/
  styles/tokens.css     design tokens (colours, type, radii, shadows)
  styles/global.css     base styles, .eyebrow, responsive helpers (.only-mobile / .only-desktop, 900px)
  components/ui/        Button, Logo, PhotoSlot, Eyebrow, BackButton, StatusBadge, Stars
  components/site/      SiteHeader, SiteFooter, MobileActionBar
  pages/                one folder-level component + CSS file per route
  data/hospital.ts      hospital, doctor, services, facilities, testimonials copy
  data/assistant.ts     assistant's approved answers and conversation logic
  data/dashboard.ts     sample dashboard data
  data/images.ts        photos used on the site, with alt text
  lib/api.ts            appointment submission stub — connect to the real backend here
```

## How the assistant works

The assistant (`/assistant`) is **scripted, not an AI model**: every reply is a fixed, hospital-approved
answer chosen by matching keywords in what the visitor types (`src/data/assistant.ts`). For each message it:

1. Shows the labour-ward warning for emergency words (pain, bleeding, medicine…), even mid-booking.
2. Stops a booking on "cancel".
3. Treats the message as the answer if it just asked something (booking details, or "would you like a call back?").
4. Matches approved topics (booking, packing, visiting hours, OPD timings, postnatal care, services, location, phone), then small talk (hi, thanks, bye, help).
5. Otherwise says it has no approved answer and offers a call back.

To change an answer or add a topic, edit `ANSWERS`, `MENU` and the keyword patterns in `RE`, then add a case
to `src/data/assistant.test.ts` and run `npm test`.

## Before launch

- Hospital address and phone number are real. Doctor credentials, email, timings and testimonials are still **placeholder copy** (`src/data/hospital.ts`).
- Photos are temporary Unsplash stock images (`src/assets/images/`, credits in `docs/IMAGE_CREDITS.md`). Replace them with the hospital's own photos, especially Dr. Shinde's portrait.
- `submitAppointmentRequest` (`src/lib/api.ts`) and the dashboard data are stubs. The assistant's booking and call-back requests are not sent anywhere yet either; connect them to the same backend.
