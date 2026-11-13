/**
 * Loads every tenants/<id>/tenant.json at build time, plus the images next to it
 * (colours, images, names). Tenant text is handled by scripts/generate-tenant-messages.mjs.
 * Nothing here needs editing to add a tenant: add a folder to tenants/ instead.
 */

export type TenantConfig = {
    name: string;
    organisation: string;
    /** Which side the brand panel sits on, on wide screens. Defaults to "left". */
    brandPanelSide?: "left" | "right";
    images: {
        logo: string | null;
        logoAlt?: string;
        background: string | null;
    };
    colours: {
        brand: string;
        accent: string;
        accentDark: string;
        tint: string;
        tint2: string;
        focus: string;
        panel: {
            base: string;
            text: string;
            subtext: string;
            muted: string;
        };
    };
    messages?: Record<string, string>;
};

export type Tenant = TenantConfig & {
    id: string;
    logoUrl: string | null;
    backgroundUrl: string | null;
    /** The font file dropped in tenants/<id>/, if any (see README → Fonts). */
    fontFile: FontFile | undefined;
};

export type FontFile = { url: string; format: string; isVariable: boolean };

const configFiles = import.meta.glob<TenantConfig>("../../tenants/*/tenant.json", {
    eager: true,
    import: "default"
});

const imageFiles = import.meta.glob<string>("../../tenants/*/*.{svg,png,jpg,jpeg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default"
});

const fontFiles = import.meta.glob<string>("../../tenants/*/*.{woff2,woff,ttf,otf}", {
    eager: true,
    query: "?url",
    import: "default"
});

const fontFormats: Record<string, string> = {
    woff2: "woff2",
    woff: "woff",
    ttf: "truetype",
    otf: "opentype"
};

/** The one font file in tenants/<id>/ (the build makes sure there's at most one). */
function resolveFontFile(id: string): FontFile | undefined {
    const prefix = `../../tenants/${id}/`;
    const path = Object.keys(fontFiles).find(p => p.startsWith(prefix) && !p.slice(prefix.length).includes("/"));
    if (path === undefined) return undefined;
    const fileName = path.slice(prefix.length);
    const ext = fileName.split(".").pop() ?? "";
    return {
        url: fontFiles[path],
        format: fontFormats[ext],
        // Google's variable fonts are named like "Inter-VariableFont_wght.ttf" or "Inter[wght].ttf"
        isVariable: /variable|\[/i.test(fileName)
    };
}

function resolveImage(id: string, ref: string | null | undefined): string | null {
    if (!ref) return null;
    if (/^https?:\/\//.test(ref)) return ref;

    const url = imageFiles[`../../tenants/${id}/${ref.replace(/^\.\//, "")}`];
    if (url === undefined) {
        console.error(`Tenant "${id}": image "${ref}" not found in tenants/${id}/`);
        return null;
    }
    return url;
}

export const tenants: Record<string, Tenant> = Object.fromEntries(
    Object.entries(configFiles).map(([path, config]) => {
        const parts = path.split("/");
        const id = parts[parts.length - 2];
        return [
            id,
            {
                ...config,
                id,
                fontFile: resolveFontFile(id),
                logoUrl: resolveImage(id, config.images.logo),
                backgroundUrl: resolveImage(id, config.images.background)
            }
        ];
    })
);

export function getTenant(themeName: string): Tenant {
    const tenant = tenants[themeName];
    if (tenant === undefined) {
        throw new Error(
            `No tenant config for theme "${themeName}". Expected tenants/${themeName}/tenant.json.`
        );
    }
    return tenant;
}


/**
 * @font-face rule for a tenant's font file, used for all text on its pages.
 * Without a font file, the default fonts in styles.css are used.
 *
 * A variable font provides every weight itself. A static font (e.g. Poppins-Regular.ttf)
 * is declared as the regular weight, and the browser makes the bold text (headings,
 * labels, buttons) bolder from it.
 */
export function getTenantFontCss(tenant: Tenant): { css: string; stack: string | undefined } {
    const file = tenant.fontFile;
    if (file === undefined) return { css: "", stack: undefined };

    const family = `tenant-${tenant.id}`;
    const weight = file.isVariable ? "100 900" : "400";
    return {
        css:
            `@font-face{font-family:"${family}";src:url("${file.url}") format("${file.format}");` +
            `font-weight:${weight};font-style:normal;font-display:swap;}`,
        stack: `"${family}", "Helvetica Neue", Arial, system-ui, sans-serif`
    };
}
