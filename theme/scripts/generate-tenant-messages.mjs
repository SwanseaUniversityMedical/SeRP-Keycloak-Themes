/**
 * Writes src/login/i18n.ts from tenants/_defaults.json and tenants/<id>/tenant.json.
 *
 * Keycloakify reads the messages passed to withCustomTranslations() straight out of
 * i18n.ts at build time and copies them into the theme's messages_*.properties files,
 * so Keycloak itself uses them too (for example in error messages it generates). That
 * only works if the messages are written out literally in i18n.ts, so this script
 * generates the file instead of building the messages at runtime.
 *
 * Runs automatically before `npm run build`, `npm run dev` and `npm run storybook`.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import keycloakEnglish from "keycloakify/login/i18n/messages_defaultSet/en.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tenantsDir = join(root, "tenants");
const outFile = join(root, "src", "login", "i18n.ts");

const readJson = path => JSON.parse(readFileSync(path, "utf8"));

const defaults = readJson(join(tenantsDir, "_defaults.json")).messages ?? {};

const tenants = readdirSync(tenantsDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith("_"))
    .filter(e => existsSync(join(tenantsDir, e.name, "tenant.json")))
    .map(e => ({ id: e.name, ...readJson(join(tenantsDir, e.name, "tenant.json")) }))
    .sort((a, b) => a.id.localeCompare(b.id));

const fill = (text, tenant) =>
    text.replace(/\{\{\s*(name|organisation)\s*\}\}/g, (_, field) => tenant[field]);

// Every key set in _defaults.json or any tenant gets a value for every tenant:
// the tenant's own text, else the shared default, else Keycloak's built-in English.
const keys = [...new Set([...Object.keys(defaults), ...tenants.flatMap(t => Object.keys(t.messages ?? {}))])];

const en = {};
for (const key of keys) {
    en[key] = Object.fromEntries(
        tenants.map(t => [t.id, fill(t.messages?.[key] ?? defaults[key] ?? keycloakEnglish[key] ?? key, t)])
    );
}

const literal = JSON.stringify({ en }, null, 4).replace(/\n/g, "\n    ");

const source = `/* eslint-disable */
// ---------------------------------------------------------------------------------
// GENERATED FILE - do not edit. Change tenants/_defaults.json or tenants/<id>/tenant.json
// instead; this file is rewritten by scripts/generate-tenant-messages.mjs on every build.
// ---------------------------------------------------------------------------------
import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations(${literal})
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
`;

const previous = existsSync(outFile) ? readFileSync(outFile, "utf8") : "";
if (previous !== source) {
    writeFileSync(outFile, source);
    console.log(`Generated src/login/i18n.ts (${keys.length} messages × ${tenants.length} tenants)`);
}
