import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { keycloakify } from "keycloakify/vite-plugin";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Every folder in tenants/ that contains a tenant.json becomes a Keycloak login theme,
 * named after the folder. Folders starting with "_" are ignored.
 */
function loadTenantIds(): string[] {
    const tenantsDir = fileURLToPath(new URL("./tenants", import.meta.url));

    const ids = readdirSync(tenantsDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && !entry.name.startsWith("_"))
        .filter(entry => existsSync(join(tenantsDir, entry.name, "tenant.json")))
        .map(entry => entry.name)
        .sort();

    if (ids.length === 0) {
        throw new Error("No tenants found. Add a folder with a tenant.json to tenants/.");
    }

    for (const id of ids) {
        validateTenant(tenantsDir, id);
    }

    return ids;
}

/** Fails the build early with a clear message instead of producing a broken page. */
function validateTenant(tenantsDir: string, id: string) {
    const where = `tenants/${id}/tenant.json`;
    const fail = (problem: string): never => {
        throw new Error(`${where}: ${problem}`);
    };

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
        fail(`folder name "${id}" must be lowercase letters, numbers and hyphens (it becomes the theme name)`);
    }

    let tenant: Record<string, any>;
    try {
        tenant = JSON.parse(readFileSync(join(tenantsDir, id, "tenant.json"), "utf8"));
    } catch (error) {
        return fail(`is not valid JSON (${(error as Error).message})`);
    }

    for (const field of ["name", "organisation"]) {
        if (typeof tenant[field] !== "string" || tenant[field] === "") fail(`"${field}" is required`);
    }

    if (tenant.brandPanelSide !== undefined && !["left", "right"].includes(tenant.brandPanelSide)) {
        fail(`"brandPanelSide" must be "left" or "right"`);
    }

    for (const field of ["logo", "background"]) {
        const ref = tenant.images?.[field];
        if (ref === undefined) fail(`"images.${field}" is required (use null for none)`);
        if (typeof ref === "string" && !/^https?:\/\//.test(ref) && !existsSync(join(tenantsDir, id, ref))) {
            fail(`"images.${field}" points to "${ref}", but tenants/${id}/${ref} does not exist`);
        }
    }

    const colours = tenant.colours ?? {};
    for (const field of ["brand", "accent", "accentDark", "tint", "tint2", "focus"]) {
        if (typeof colours[field] !== "string") fail(`"colours.${field}" is required`);
    }
    for (const field of ["base", "text", "subtext", "muted"]) {
        if (typeof colours.panel?.[field] !== "string") fail(`"colours.panel.${field}" is required`);
    }

    const messages = tenant.messages ?? {};
    for (const [key, value] of Object.entries(messages)) {
        if (typeof value !== "string") fail(`"messages.${key}" must be text`);
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        keycloakify({
            themeName: loadTenantIds(),
            accountThemeImplementation: "none",
            groupId: "serp",
            artifactId: "serp-keycloak-themes",
            // Build a single jar, for Keycloak 26 and newer (Keycloakify's "all other versions").
            // CI renames it to serp-keycloak-themes-<version>.jar when releasing.
            keycloakVersionTargets: {
                "22-to-25": false,
                "all-other-versions": "serp-keycloak-themes.jar"
            }
        })
    ]
});
