<p align="center">
  <img src="https://img.shields.io/badge/Astro-4.x-FF5D01?style=for-the-badge&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Refine-4.x-1890FF?style=for-the-badge" alt="Refine" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Ant_Design-5.x-0170FE?style=for-the-badge&logo=antdesign&logoColor=white" alt="Ant Design" />
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="License" />
</p>

<h1 align="center">UNJYNX Web</h1>
<h3 align="center">Landing Page + Admin Panel + Developer Portal</h3>

<p align="center">
  Three web applications in one repository — a marketing landing page built with Astro, an admin dashboard for content and user management, and a developer portal for system monitoring.
</p>

---

## Applications

### 1. Landing Page (`/landing`)

The public-facing marketing site for UNJYNX. Built with Astro for maximum performance (static HTML, zero JS by default).

**Live**: [unjynx.me](https://unjynx.me)

| Component | Description |
|-----------|-------------|
| `Hero` | App tagline, CTA, and hero visual |
| `Features` | Core feature showcase (6 features) |
| `Channels` | Multi-channel reminder visualization |
| `Pricing` | Plan comparison (Free, Pro, Team, Family) |
| `Testimonials` | User testimonials carousel |
| `FAQ` | Frequently asked questions accordion |
| `Nav` | Responsive navigation bar |
| `Footer` | Links, social, legal |

**Pages**: Home (`/`), Privacy Policy (`/privacy`), Terms of Service (`/terms`)

**Stack**: Astro 4.x, Tailwind CSS 3.4, `@astrojs/sitemap`, Playwright E2E tests

---

### 2. Admin Panel (`/admin`)

Internal dashboard for managing UNJYNX platform operations. Built with React + Refine (headless admin framework) + Ant Design.

**Live**: [unjynx.me/admin](https://unjynx.me/admin)

| Page | Description |
|------|-------------|
| **Login** | Logto OIDC authentication |
| **Dashboard** | Key metrics, active users, task stats |
| **Users** | User management, roles, bans |
| **Content** | Daily content management (60+ categories) |
| **Notifications** | Channel health, delivery stats, failures |
| **Feature Flags** | Toggle features per tier/user |
| **Analytics** | Usage analytics, retention, engagement |
| **Support** | Support ticket management |
| **Billing** | Subscription overview, revenue |
| **Compliance** | DPDP Act tracking, data requests |

**Stack**: React 19, Refine 4.x, Ant Design 5.x, Vite, TypeScript

---

### 3. Developer Portal (`/dev-portal`)

Internal tool for engineering operations and system monitoring. Same tech stack as Admin panel.

| Page | Description |
|------|-------------|
| **Login** | Logto OIDC authentication |
| **System Health** | Service status, uptime, alerts |
| **Database** | Schema browser, query stats, connections |
| **API Management** | API key management, rate limits |
| **Deployment** | Deployment history, rollback |
| **Notifications** | Channel provider status, queue depth |
| **AI Models** | Model usage, costs, latency |
| **Channel Providers** | WhatsApp/Telegram/SMS provider health |
| **Data Pipeline** | Sync status, job queue monitoring |

**Stack**: React 19, Refine 4.x, Ant Design 5.x, Vite, TypeScript

---

## Project Structure

```
unjynx-web/
├── landing/                 # Astro marketing site
│   ├── src/
│   │   ├── components/      # 8 Astro components
│   │   └── pages/           # 3 pages (index, privacy, terms)
│   ├── public/              # Static assets
│   ├── tests/               # Playwright E2E tests
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   └── vercel.json
├── admin/                   # React admin dashboard
│   ├── src/
│   │   └── pages/           # 10 page directories
│   ├── index.html
│   └── vite.config.ts
├── dev-portal/              # React developer portal
│   ├── src/
│   │   └── pages/           # 10 page directories
│   ├── index.html
│   └── vite.config.ts
└── CNAME                    # GitHub Pages custom domain
```

---

## Tech Stack

| App | Framework | UI | Build | Hosting |
|-----|-----------|----|----|---------|
| **Landing** | Astro 4.x | Tailwind CSS 3.4 | Astro CLI | GitHub Pages |
| **Admin** | React 19 + Refine 4.x | Ant Design 5.x | Vite | GitHub Pages |
| **Dev Portal** | React 19 + Refine 4.x | Ant Design 5.x | Vite | GitHub Pages |

### Shared Dependencies

- **Authentication**: Logto OIDC (shared with backend)
- **API Client**: Refine simple-rest data provider → `api.unjynx.me`
- **TypeScript**: 5.x across all apps
- **Testing**: Playwright (landing), Vitest (admin, dev-portal)

---

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm 10+
- Backend API running (for admin/dev-portal)

### Landing Page

```bash
cd landing
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # Static output in dist/
```

### Admin Panel

```bash
cd admin
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # Static output in dist/
```

### Developer Portal

```bash
cd dev-portal
pnpm install
pnpm dev        # http://localhost:5174
pnpm build      # Static output in dist/
```

---

## Deployment

All three apps are deployed to **GitHub Pages** via the `gh-pages` branch.

| App | URL | Path |
|-----|-----|------|
| Landing | `unjynx.me` | `/` |
| Admin | `unjynx.me/admin/` | `/admin/` |
| Dev Portal | `unjynx.me/dev-portal/` | (internal link) |

### Custom Domain

DNS is managed via Cloudflare:
- `unjynx.me` → GitHub Pages (CNAME)
- SSL enforced via GitHub Pages settings

### CI/CD

```
Push to main → GitHub Actions → Build all 3 apps → Deploy to gh-pages branch
```

---

## Authentication Flow

Both Admin and Dev Portal use **Logto OIDC** for authentication:

1. User visits `/admin/login` or `/dev-portal/login`
2. Redirected to `auth.unjynx.me` (Logto)
3. User authenticates (username/password, social, or MFA)
4. Redirected back with authorization code
5. Token exchange happens at `/callback`
6. JWT stored in memory, used for API calls

**Admin credentials** are managed in Logto with role-based access:
- `super_admin` — full access to both panels
- `admin` — admin panel only
- `developer` — dev portal only

---

## Related Repositories

| Repository | Description |
|-----------|-------------|
| [unjynx-app](https://github.com/AndrousStark/unjynx-app) | Flutter cross-platform mobile app |
| [unjynx-backend](https://github.com/AndrousStark/unjynx-backend) | Hono + Drizzle + PostgreSQL API server (private) |

---

<p align="center">
  Built by <strong>METAminds</strong> — an AI agency firm
</p>
