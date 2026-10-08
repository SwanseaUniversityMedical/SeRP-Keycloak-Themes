import { useEffect, type CSSProperties } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import { getTenant } from "./tenants";
import "./styles.css";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        infoNode = null,
        documentTitle,
        kcContext,
        i18n,
        doUseDefaultCss,
        children
    } = props;

    const { msg, msgStr, advancedMsgStr, currentLanguage, enabledLanguages } = i18n;
    const { realm, auth, url, message, isAppInitiatedAction, themeName, pageId } = kcContext;

    const tenant = getTenant(themeName);

    // Brand panel text for this page, e.g. panel.login-otp.headline, falling back to panel.default.*
    const pageKey = pageId.replace(/\.ftl$/, "");
    const panelText = (part: "headline" | "subtext") => {
        const key = `panel.${pageKey}.${part}`;
        const text = advancedMsgStr(key);
        return text === key ? advancedMsgStr(`panel.default.${part}`) : text;
    };

    // Realm: "Display name" under Realm settings → General, falling back to the realm's ID.
    const realmName = realm.displayName || realm.name;

    // Client (the application the user is signing in to): its "Name" under Clients → <client>,
    // falling back to its Client ID. advancedMsgStr resolves names like ${client_account-console}.
    const client = kcContext.client;
    const clientName = client?.name ? advancedMsgStr(client.name) : client?.clientId;

    useEffect(() => {
        document.title =
            documentTitle ??
            (clientName
                ? advancedMsgStr("documentTitleClientRealm", clientName, realmName)
                : msgStr("loginTitle", realmName));
    }, []);

    useSetClassName({ qualifiedName: "html", className: "kc-html" });
    useSetClassName({ qualifiedName: "body", className: "kc-body" });

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

    if (!isReadyToRender) {
        return null;
    }

    // Tenant colours become CSS custom properties, used throughout styles.css.
    const { colours } = tenant;
    const panelImage = tenant.backgroundUrl ? `url("${tenant.backgroundUrl}")` : "none";
    const themeStyle = {
        "--brand": colours.brand,
        "--accent": colours.accent,
        "--accent-dark": colours.accentDark,
        "--tint": colours.tint,
        "--tint-2": colours.tint2,
        "--focus": colours.focus,
        "--panel-base": colours.panel.base,
        "--panel-text": colours.panel.text,
        "--panel-subtext": colours.panel.subtext,
        "--panel-muted": colours.panel.muted,
        "--panel-bg": panelImage
    } as CSSProperties;

    // On the sign-in page the title says what the user is signing in to:
    // "Signing in to <client> in <realm>" (or "Signing in to <realm>" when there's no client).
    const signInTitle = clientName
        ? advancedMsgStr("contextClientRealm", clientName, realmName)
        : advancedMsgStr("contextRealm", realmName);

    return (
        <div className={`kc-split kc-split--brand-${tenant.brandPanelSide ?? "left"}`} style={themeStyle}>
            {/* Brand panel: left on wide screens by default (tenant.json "brandPanelSide") */}
            <aside className="kc-brand">
                <div className="kc-brand__logo">
                    {tenant.logoUrl !== null && (
                        <img src={tenant.logoUrl} alt={tenant.images.logoAlt ?? tenant.name} />
                    )}
                </div>
                <div className="kc-brand__copy">
                    <p className="kc-brand__headline">{panelText("headline")}</p>
                    <p className="kc-brand__subtext">{panelText("subtext")}</p>
                </div>
                <p className="kc-brand__footer">{advancedMsgStr("brandPanelFooter")}</p>
            </aside>

            {/* Form panel */}
            <main className="kc-main">
                <div className="kc-main__top">
                    {realm.internationalizationEnabled && enabledLanguages.length > 1 && (
                        <label className="kc-locale">
                            <span>{msg("languages")}</span>
                            <select
                                value={currentLanguage.languageTag}
                                onChange={e => {
                                    const target = enabledLanguages.find(l => l.languageTag === e.target.value);
                                    if (target) window.location.href = target.href;
                                }}
                            >
                                {enabledLanguages.map(({ languageTag, label }) => (
                                    <option key={languageTag} value={languageTag}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                </div>

                <div className="kc-main__center">
                    <div className="kc-card">
                        <header className="kc-card__header">
                            {auth !== undefined && auth.showUsername && !auth.showResetCredentials ? (
                                <div className="kc-attempted-user">
                                    <span>{auth.attemptedUsername}</span>
                                    <a href={url.loginRestartFlowUrl}>{msg("restartLoginTooltip")}</a>
                                </div>
                            ) : null}
                            <h1 className="kc-card__title">{pageId === "login.ftl" ? signInTitle : headerNode}</h1>
                            {displayRequiredFields && (
                                <p className="kc-required-note">
                                    <span className="kc-required">*</span> {msg("requiredFields")}
                                </p>
                            )}
                        </header>

                        {displayMessage &&
                            message !== undefined &&
                            (message.type !== "warning" || !isAppInitiatedAction) && (
                                <div className={`kc-alert kc-alert--${message.type}`} role="alert">
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: kcSanitize(message.summary)
                                        }}
                                    />
                                </div>
                            )}

                        {children}

                        {auth !== undefined && auth.showTryAnotherWayLink && (
                            <form id="kc-select-try-another-way-form" action={url.loginAction} method="post">
                                <input type="hidden" name="tryAnotherWay" value="on" />
                                <button type="submit" className="kc-link-button">
                                    {msg("doTryAnotherWay")}
                                </button>
                            </form>
                        )}


                        {displayInfo && <div className="kc-info">{infoNode}</div>}
                    </div>
                </div>

                <footer className="kc-main__footer">
                    <span>{advancedMsgStr("footerCopyright", String(new Date().getFullYear()))}</span>
                </footer>
            </main>
        </div>
    );
}

