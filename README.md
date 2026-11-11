# NOVA Admin

NOVA’s administration panel for desktop and mobile. The app uses React 19, Vite, strict TypeScript, Redux Toolkit, TanStack Query, Axios, Styled Components, Formik, and Yup. It supports Persian RTL, English LTR, and light and dark themes.

[Admin Figma](https://www.figma.com/design/p5N8A2My9IWXhT2wmiH4gg/NOVA-%E2%80%94-Admin-UI-Design?node-id=5-191) · [Frame and state map](docs/figma-handoff.md) · [Screenshots](docs/screenshots)

## Run locally

Use Node 24.18.0 and pnpm 10.14.0.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). The example environment points to FakeStoreAPI. Use a public demo user from the API provider’s test data. The demo login survives a refresh in the same tab. Set `VITE_FAKE_STORE_API_URL` to the FakeStoreAPI origin or a contract-compatible test endpoint. Production hosting for the built SPA needs an `index.html` rewrite for deep links.

```powershell
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

## Architecture

| Location                                     | Responsibility                                                                   |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `Pages`, `Routes`                            | Thin entry points, route guards and internal return paths                        |
| `Components`, `Shared`, `Modals`             | Screens, controls, toast feedback and keyboard-accessible dialogs                |
| `Redux`, `Storage`                           | Session state, session-only CRUD changes, locale and theme preferences           |
| `Utils/api`, `Utils/services`, `types/Enums` | Query configuration, Axios transport, response adapters and resource identifiers |
| `Dictionary`, `Validations`                  | Bilingual copy and Formik/Yup validation                                         |
| `assets`                                     | Local OFL fonts and icons                                                        |

### Requests and session

- List and category reads use TanStack Query with a 60-second stale window and a five-minute cache, so closing the Add or Edit dialog without a change reuses cached data instead of calling the API again. Creates, edits and deletes update the session overlay immediately; returning to the list stays on the cached response. The Axios fetch adapter bypasses the browser HTTP cache. Concurrent reads of the same key share one request. Product and user details have separate resource-and-ID query keys. Focus, reconnect and automatic failure retries are disabled.
- Login and writes use mutations. The mock token is stored in `sessionStorage` for refresh recovery in the same tab. It expires after eight hours or at an earlier API token expiry. Confirming sign-out clears the session, the temporary records and the query state. Passwords stay out of Redux and browser storage.
- The router guards the demo UI. FakeStoreAPI’s management endpoints are public. The provider has no documented refresh, revoke, secure session cookie, or authorization-role contract. A management 401 ends the demo session. A 403 leaves it intact and shows an authorization error. Server-enforced authorization and an HttpOnly session require an application backend.
- Products and users support details, creation, updates, deletion, search and ten rows per page. Successful CRUD changes are applied over each fresh list response for the current tab session. FakeStoreAPI simulates writes and may repeat identifiers. New local records get unique browser keys and subsequent edits or deletes to those records stay local. User passwords in API responses are discarded.
- Product photos accept a URL or a JPEG, PNG or WebP file up to 2 MB. Local previews are stored with the demo changes, subject to the browser’s session storage quota. FakeStoreAPI accepts an image URL and provides no file-upload endpoint. The product write sends a placeholder URL when the image is local. The form discloses that the file stays in the tab. Numeric mock prices are shown as toman.

Full CRUD, pagination, mobile cards and drawer navigation extend the desktop and create/list scope shown in the PDF. The original case-sensitive folder structure is preserved.

### Dashboard, searches, and pagination

The Dashboard is the default destination after login and counts products and users from live list responses plus the current session's confirmed changes. The catalog breakdown groups those products by category. FakeStoreAPI does not expose a recent-activity feed or business analytics. Product management exposes Add product in the header. Create and edit dialogs share the same form modal, and direct create URLs remain supported.

Lists default to 10 rows and offer 5, 10, 15, and 25. The settled filters and page size are part of the query key and issue a fresh read. Product category selection uses the documented category endpoint. FakeStoreAPI has no title, price-range, name, or phone search parameters and no page offset or filtered total. Those filters and page boundaries are applied to each fresh response. Sending only a result limit would truncate later pages and distort totals.
