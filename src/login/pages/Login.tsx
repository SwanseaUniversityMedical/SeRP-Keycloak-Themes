import { useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
    const { realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;
    const { msg, msgStr, advancedMsgStr } = i18n;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const hasCredentialError = messagesPerField.existsError("username", "password");

    const usernameLabel = !realm.loginWithEmailAllowed
        ? msg("username")
        : !realm.registrationEmailAsUsername
          ? msg("usernameOrEmail")
          : msg("email");

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!hasCredentialError}
            headerNode={msg("loginAccountTitle")} // replaced by "Signing in to …" in Template.tsx
            displayInfo={false}
        >
            {realm.password && realm.registrationAllowed && !registrationDisabled && (
                <p className="kc-card__lede">
                    {msg("noAccount")} <a href={url.registrationUrl}>{msg("doRegister")}</a>
                </p>
            )}

            {realm.password && (
                <form
                    id="kc-form-login"
                    className="kc-form"
                    action={url.loginAction}
                    method="post"
                    onSubmit={() => {
                        setIsSubmitting(true);
                        return true;
                    }}
                >
                    {!usernameHidden && (
                        <div className="kc-field">
                            <label htmlFor="username" className="kc-label">
                                {usernameLabel}
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className="kc-input"
                                defaultValue={login.username ?? ""}
                                autoFocus
                                autoComplete="username"
                                aria-invalid={hasCredentialError}
                            />
                        </div>
                    )}

                    <div className="kc-field">
                        <div className="kc-label-row">
                            <label htmlFor="password" className="kc-label">
                                {msg("password")}
                            </label>
                            {realm.resetPasswordAllowed && (
                                <a href={url.loginResetCredentialsUrl}>{msg("doForgotPassword")}</a>
                            )}
                        </div>
                        <div className="kc-input-group">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                className="kc-input"
                                autoComplete="current-password"
                                aria-invalid={hasCredentialError}
                            />
                            <button
                                type="button"
                                className="kc-pw-toggle"
                                aria-label={showPassword ? msgStr("hidePassword") : msgStr("showPassword")}
                                aria-controls="password"
                                onClick={() => setShowPassword(v => !v)}
                            >
                                {showPassword ? advancedMsgStr("passwordToggleHide") : advancedMsgStr("passwordToggleShow")}
                            </button>
                        </div>
                        {hasCredentialError && (
                            <span
                                id="input-error"
                                className="kc-field-error"
                                aria-live="polite"
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(messagesPerField.getFirstError("username", "password"))
                                }}
                            />
                        )}
                    </div>

                    {realm.rememberMe && !usernameHidden && (
                        <label className="kc-checkbox-row">
                            <input
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                className="kc-checkbox"
                                defaultChecked={!!login.rememberMe}
                            />
                            <span>{msg("rememberMe")}</span>
                        </label>
                    )}

                    <input type="hidden" id="id-hidden-input" name="credentialId" value={auth.selectedCredential} />
                    <button
                        id="kc-login"
                        name="login"
                        type="submit"
                        className="kc-btn kc-btn--primary kc-btn--block"
                        disabled={isSubmitting}
                    >
                        {msgStr("doLogIn")}
                    </button>
                </form>
            )}

        </Template>
    );
}
