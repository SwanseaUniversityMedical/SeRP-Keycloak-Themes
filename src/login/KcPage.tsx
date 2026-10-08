import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import Template from "./Template";

const UserProfileFormFields = lazy(() => import("keycloakify/login/UserProfileFormFields"));
const Login = lazy(() => import("./pages/Login"));
const LoginPageExpired = lazy(() => import("./pages/LoginPageExpired"));

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;
    const { i18n } = useI18n({ kcContext });

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return (
                            <Login
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    case "login-page-expired.ftl":
                        return (
                            <LoginPageExpired
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={false}
                            />
                        );
                    default:
                        // Every other page (register, reset password, OTP, update password,
                        // verify email, terms, ...) uses Keycloakify's built-in
                        // page markup inside our split Template, styled via `classes` below.
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={false}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}

// With doUseDefaultCss={false}, Keycloak's PatternFly CSS is not loaded and the
// built-in pages use these class names instead. They are styled in styles.css.
const classes = {
    kcFormGroupClass: "kc-field",
    kcLabelClass: "kc-label",
    kcInputClass: "kc-input",
    kcInputErrorMessageClass: "kc-field-error",
    kcInputHelperTextBeforeClass: "kc-hint",
    kcInputHelperTextAfterClass: "kc-hint",
    kcInputGroup: "kc-input-group",
    kcFormPasswordVisibilityButtonClass: "kc-pw-toggle",
    kcFormOptionsWrapperClass: "kc-form-options",
    kcFormSettingClass: "kc-form-settings",
    kcCheckboxInputClass: "kc-checkbox",
    kcFormButtonsClass: "kc-form-buttons",
    kcButtonClass: "kc-btn",
    kcButtonPrimaryClass: "kc-btn--primary",
    kcButtonDefaultClass: "kc-btn--secondary",
    kcButtonBlockClass: "kc-btn--block",
    kcButtonLargeClass: ""
} satisfies { [key in ClassKey]?: string };
