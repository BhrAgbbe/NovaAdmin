# NOVA Admin

NOVA’s desktop administration panel. The app uses React 19, Vite, strict TypeScript, Redux Toolkit, Axios, Styled Components, Formik, and Yup. It supports Persian RTL, English LTR, and light and dark themes.

[Admin Figma](https://www.figma.com/design/p5N8A2My9IWXhT2wmiH4gg/NOVA-%E2%80%94-Admin-UI-Design?node-id=5-191) · [Frame and state map](docs/figma-handoff.md)

## Run locally

Use Node 24.18.0 and pnpm 10.14.0.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). The example environment points to FakeStoreAPI. Use a public demo user from the API provider’s test data. The login is a frontend demo session and resets on refresh. Production hosting for the built SPA needs an `index.html` rewrite for deep links.

## Architecture

| Location                                     | Responsibility                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Pages`, `Routes`                            | Thin route entry points, route constants, protected workspace, and redirect back to the requested page |
| `Components`, `Shared`, `Modals`             | Screen-specific views, reusable controls, and the brief’s reserved modal directory                     |
| `Redux`, `Storage`                           | Authenticated status and session additions, in-memory token, browser locale and theme preferences      |
| `Utils/api`, `Utils/services`, `types/Enums` | One Axios instance, validated API response boundaries, and resource identifiers                        |
| `Dictionary`, `Validations`                  | Bilingual copy and Formik/Yup validation                                                               |
| `assets`                                     | Local OFL fonts and the Figma icon assets                                                              |

The router gates Products and Users before their screens mount. Lists load independently and keep search state local to the view. The create forms send typed payloads through the resource service. Successful creations are merged into the list using local row keys, including when FakeStoreAPI repeats an ID. New rows last for the signed-in session. User records are mapped to safe list fields before they reach UI state. The user POST adapter sends the mock controller’s required empty address/geolocation shape behind the six-field form.

FakeStoreAPI supplies a public, simulated backend. New entries are session-only, and Store uses its own independent state. The numeric mock prices are displayed as toman without conversion. Routes and module boundaries follow the NOVA brief, with naming and code organization modeled on the Tamin list, form, and transport patterns.

## Verify

```powershell
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

Playwright starts a loopback-only HTTP fixture and the Vite server. On Windows it uses Microsoft Edge by default. Elsewhere run `pnpm exec playwright install chromium` before the tests. The test credentials belong to the loopback fixture.

## Screenshots

- [Persian sign-in](docs/screenshots/admin-login.png)
- [Dark Persian product table](docs/screenshots/admin-products-dark.png)

- [Dark Persian create product](docs/screenshots/admin-create-product.png)

## Implementation time

Approximately 23 minutes of combined implementation and verification time across both NOVA repositories.
