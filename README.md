# Life Springs Hospital

Patient website, AI enquiry assistant and owner dashboard for Life Springs Hospital, a maternity hospital in Pune.
Built with React, TypeScript and Vite.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
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
  lib/api.ts            appointment submission stub — connect to the real backend here
```

## Before launch

- Hospital address and phone number are real. Doctor credentials, email, timings and testimonials are still **placeholder copy** (`src/data/hospital.ts`).
- Photos are striped placeholders with art-direction captions; pass `src` to `<PhotoSlot>` to use real photography.
- `submitAppointmentRequest` (`src/lib/api.ts`) and the dashboard data are stubs.
