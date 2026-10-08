/**
 * Loads every tenants/<id>/tenant.json at build time, plus the images next to it
 * (colours, images, names). Tenant text is handled by scripts/generate-tenant-messages.mjs.
 * Nothing here needs editing to add a tenant: add a folder to tenants/ instead.
 */

export type TenantConfig = {
    name: string;
    organisation: string;
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
            scrim: string;
        };
    };
    messages?: Record<string, string>;
};

export type Tenant = TenantConfig & {
    id: string;
    logoUrl: string | null;
    backgroundUrl: string | null;
};

const configFiles = import.meta.glob<TenantConfig>("../../tenants/*/tenant.json", {
    eager: true,
    import: "default"
});

const imageFiles = import.meta.glob<string>("../../tenants/*/*.{svg,png,jpg,jpeg,webp,gif,avif}", {
    eager: true,
    query: "?url",
    import: "default"
});

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

