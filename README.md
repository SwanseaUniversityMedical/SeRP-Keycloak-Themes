# Keycloak login theme: one JSON per tenant

A Keycloakify (v11) login theme, based on the official keycloakify-starter with a split layout: a branded image panel on the left and
the form on the right. Each tenant is a folder in `tenants/` with one `tenant.json`
and its images. Every folder becomes a separate login theme in Keycloak.

## Adding a tenant

1. Copy an existing tenant folder and rename it. The folder name becomes the theme name
   in Keycloak, so use lowercase letters, numbers and hyphens:

   ```bash
   cp -r tenants/dpuk tenants/newhub
   ```

2. Put the tenant's logo and background image in `tenants/newhub/`.

3. Edit `tenants/newhub/tenant.json`: name, organisation, image file names, colours and
   any text you want to change.

4. Build:

   ```bash
   npm run build-keycloak-theme
   ```

5. Open a pull request. When it's merged, CI releases a new jar. Deploy it, then in Keycloak choose **Realm settings →
   Themes → Login theme → newhub** for the tenant's realm.

Nothing in `src/` needs changing. The build checks every `tenant.json` and stops with a
clear message if something is missing, such as an image file that isn't in the folder.

## tenant.json

```jsonc
{
    "$schema": "../tenant.schema.json",   // gives autocomplete and checks in VS Code
    "name": "DPUK",                        // short name, usable in text as {{name}}
    "organisation": "Dementias Platform UK", // usable in text as {{organisation}}
    "brandPanelSide": "left",             // optional: "left" (default) or "right"
    "images": {
        "logo": "logo.svg",                // file in this folder, a https:// URL, or null
        "logoAlt": "Dementias Hub",        // read out by screen readers
        "background": "background.webp"    // file in this folder, a https:// URL, or null
    },
    "colours": {
        "brand": "#21244C",                // main buttons
        "accent": "#B81F66",               // links, checkboxes, icons (must be readable on white)
        "accentDark": "#8E1650",           // link hover
        "tint": "#FCE7F1",                 // pale icon / label background
        "tint2": "#FDF3F8",                // paler note background
        "focus": "#AE3BED",                // keyboard focus outline
        "panel": {
            "base": "#E8EEFB",             // colour behind the image
            "text": "#21244C",             // panel headline
            "subtext": "#3A3E66",          // panel paragraph
            "muted": "#50547A",            // panel footer line
            "scrim": "linear-gradient(...)" // fade over the image so text is readable, or "none"
        }
    },
    "messages": {
        "brandPanelFooter": "{{organisation}} · Powered by SeRP",
        "panel.login.headline": "Welcome to the DPUK Data Portal."
    }
}
```

`tenants/tenant.schema.json` describes every field. Editors such as VS Code use it to
autocomplete and flag mistakes as you type.

Images: about 2560×1440 WebP works well for the background, with the artwork on the
right. Use a logo version that reads well on the panel (dark logo on a light image, white
logo on a dark one). Images in the tenant folder are bundled into the jar; `https://` URLs
are loaded from that address when the page opens.

## Text

Every piece of text on every page can be set per tenant in `messages`. For each key, a
tenant uses, in order:

1. **Realm overrides** set in the Keycloak admin console (Realm settings → Localization →
   Realm overrides). These win over everything, and need no rebuild.
2. The tenant's own `messages` in `tenant.json`.
3. The shared defaults in `tenants/_defaults.json`.
4. Keycloak's built-in English text.

`{{name}}` and `{{organisation}}` are replaced with the tenant's values. `{0}`, `{1}` are
filled in by the page (for example the year, or the client and realm names).

### This theme's own keys

See `tenants/_defaults.json` for the full list and default wording.

| Key | Where it appears |
| --- | --- |
| `panel.<page>.headline`, `panel.<page>.subtext` | Brand panel, per page. `<page>` is the Keycloak page name without `.ftl`, e.g. `login`, `register`, `login-otp`, `login-reset-password`, `login-update-password`, `login-verify-email`, `terms`, `login-page-expired`. Any page without its own text uses `panel.default.*`. |
| `brandPanelFooter` | Line at the bottom of the brand panel |
| `footerCopyright` | Page footer. `{0}` is the year. |
| `contextClientRealm`, `contextRealm` | Title of the sign-in page: "Signing in to {0} in {1}", or `contextRealm` when there's no client. `{0}` is the client, `{1}` the realm. (`loginAccountTitle` is not shown on the sign-in page.) |
| `pageExpiredInstruction`, `pageExpiredContinue`, `pageExpiredRestart` | Page-expired screen: the explanation and its two buttons (continue / start over) |
| `documentTitleClientRealm` | Browser tab title |
| `passwordToggleShow`, `passwordToggleHide` | Show/Hide button in the password field |

### Keycloak's built-in keys

Everything else on the pages (field labels, buttons, instructions, error messages) uses
Keycloak's standard message keys. Find the key for any text in
`node_modules/keycloakify/src/login/i18n/messages_defaultSet/en.ts`, then add it to a
tenant's `messages` (or to `_defaults.json` for every tenant). For example:

```json
"messages": {
    "loginAccountTitle": "Sign in to {{name}}",
    "doLogIn": "Continue",
    "emailVerifyInstruction1": "We've sent a link to {0}. Open it to activate your account."
}
```

## Project layout

```
vite.config.ts            finds tenants/*, checks each tenant.json, declares one theme per folder
tenants/
  _defaults.json          text shared by all tenants
  tenant.schema.json      describes tenant.json (for editor autocomplete)
  serp/                   tenant.json + background.webp
  dpuk/                   tenant.json + logo.svg + background.webp
src/kc.gen.tsx            generated from tenants/ on every build (don't edit)
scripts/generate-tenant-messages.mjs  writes src/login/i18n.ts from the tenant text
src/login/
  tenants.ts              loads the tenant folders (no need to edit)
  i18n.ts                 GENERATED from tenants/*.json on every build (don't edit)
  Template.tsx            the split layout shared by every page
  pages/Login.tsx         custom sign-in page
  KcPage.tsx              routes pages; built-in pages for everything except sign-in
  styles.css              all styling, driven by the tenant colours
  pages/LoginPageExpired.tsx  page-expired screen with two buttons
  KcContext.ts, KcPageStory.tsx  from the starter (types, Storybook helper)
.github/workflows/
  pr-build.yaml           checks every pull request builds; shows the error if not
  release.yaml            on merge to main: releases serp-keycloak-themes-<version>.jar
```

## Setup (first time)

You need Node.js 20 or newer, a Java JDK (17+) and Maven. On Ubuntu:

```bash
sudo apt install -y openjdk-17-jdk maven
```

Then, in this folder:

```bash
npm install
```

Every build first regenerates two files from the folders in `tenants/` (the `prebuild`
script in `package.json`):

- `src/login/i18n.ts`: all tenant text, written out in full. Keycloakify copies it into each
  theme's `messages_en.properties`, so Keycloak itself also uses the tenant's wording (for
  example in error messages it generates on the server).
- `src/kc.gen.tsx`: the list of theme names.

Commit both along with your changes. `npm run dev` and `npm run storybook` regenerate
`i18n.ts` too.

If you're behind a proxy, Maven needs its own proxy settings in `~/.m2/settings.xml`;
it ignores the `http_proxy` / `https_proxy` environment variables.

## Building locally

```bash
npm run build-keycloak-theme
```

This produces one jar, `dist_keycloak/serp-keycloak-themes.jar`, for Keycloak 26 and newer.
It contains every tenant's theme. (The jar name and the single Keycloak target are set in
`keycloakVersionTargets` in `vite.config.ts`.)

Build inside WSL's own file system (a path starting `/home/`), not under `/mnt/c`, or Maven
fails with "...pom.part.lock (No such file or directory)".

## CI and releases (GitHub Actions)

Two workflows in `.github/workflows/`:

- **`pr-build.yaml`, on every pull request into `main`:** builds the theme. If the build
  fails, the check goes red and the first error (for example a `tenant.json` problem or a
  TypeScript error) is shown on the pull request: as an annotation, in the run summary with
  the end of the build log, and as a comment on the pull request.
- **`release.yaml`, when a pull request is merged into `main`:** builds the theme and
  publishes a GitHub Release `v<version>` with `serp-keycloak-themes-<version>.jar` attached.

Versions: the major and minor numbers come from `"version"` in `package.json`; the patch
number goes up by one on every release (v1.0.0, v1.0.1, v1.0.2, ...). To start a new series,
change `package.json` to e.g. `"1.1.0"` in a pull request; the merge releases v1.1.0.

Repository settings needed (an admin may have to do these):

- Settings → Actions → General → Workflow permissions → **Read and write permissions**
  (lets the release workflow create releases and the PR workflow comment).
- Settings → Branches → add a rule for `main` → **Require a pull request before merging**
  and **Require status checks to pass** → select **Build theme**. This stops broken changes
  being merged, and stops direct pushes to `main` creating releases.

## Deploying

Download `serp-keycloak-themes-<version>.jar` from the release, copy it into Keycloak's
`providers/` folder (removing any older `serp-keycloak-themes-*.jar` there), run `kc.sh build`
if you start Keycloak with `--optimized`, and restart. Then, for each realm: **Realm settings →
Themes → Login theme** → the tenant's theme name.

On a server, with the GitHub CLI:

```bash
gh release download --repo <org>/<repo> --pattern "serp-keycloak-themes-*.jar" --dir /tmp
```

To try it locally with Docker first: `npx keycloakify start-keycloak`.

## Notes

- Pages other than sign-in use Keycloakify's built-in markup inside the split layout.
  To customise one in more detail, run `npx keycloakify eject-page`, choose the page, and
  add a `case` for it in `KcPage.tsx`.
- Which fields appear on Register comes from the realm's **User profile** settings.
- The terms page only appears if **Terms and Conditions** is enabled under Authentication →
  Required actions. Its text is the `termsText` key, set per tenant in `messages` or per
  realm in Realm overrides.
- Client and realm names in the sign-in page title come from Keycloak: Clients →
  your client → **Name**, and Realm settings → General → **Display name**.
