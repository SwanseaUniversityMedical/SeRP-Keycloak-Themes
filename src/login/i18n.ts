/* eslint-disable */
// ---------------------------------------------------------------------------------
// GENERATED FILE - do not edit. Change tenants/_defaults.json or tenants/<id>/tenant.json
// instead; this file is rewritten by scripts/generate-tenant-messages.mjs on every build.
// ---------------------------------------------------------------------------------
import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        "en": {
            "loginAccountTitle": {
                "dpuk": "Sign in to your account",
                "serp": "Sign in to your account"
            },
            "doLogIn": {
                "dpuk": "Sign in",
                "serp": "Sign in"
            },
            "noAccount": {
                "dpuk": "New here?",
                "serp": "New here?"
            },
            "doRegister": {
                "dpuk": "Create an account",
                "serp": "Create an account"
            },
            "doForgotPassword": {
                "dpuk": "Forgot password?",
                "serp": "Forgot password?"
            },
            "passwordToggleShow": {
                "dpuk": "Show",
                "serp": "Show"
            },
            "passwordToggleHide": {
                "dpuk": "Hide",
                "serp": "Hide"
            },
            "contextClientRealm": {
                "dpuk": "Signing in to {0} in {1}",
                "serp": "Signing in to {0} in {1}"
            },
            "contextRealm": {
                "dpuk": "Signing in to {0}",
                "serp": "Signing in to {0}"
            },
            "documentTitleClientRealm": {
                "dpuk": "{0} | {1}",
                "serp": "{0} | {1}"
            },
            "brandPanelFooter": {
                "dpuk": "Dementias Platform UK · Powered by SeRP",
                "serp": "Secure eResearch Platform · Supported by Swansea University"
            },
            "footerCopyright": {
                "dpuk": "© {0} Dementias Platform UK",
                "serp": "© {0} Secure eResearch Platform"
            },
            "panel.default.headline": {
                "dpuk": "Secure access to your research.",
                "serp": "Secure access to your research."
            },
            "panel.default.subtext": {
                "dpuk": "Sign in to your DPUK workspace.",
                "serp": "Sign in to your SeRP workspace."
            },
            "panel.login.headline": {
                "dpuk": "Welcome to the DPUK Data Portal.",
                "serp": "Powering Secure Data Environments."
            },
            "panel.login.subtext": {
                "dpuk": "Sign in to access your approved projects and datasets in a secure research environment.",
                "serp": "Sign in to reach your secure research workspace, projects and data — all in one trusted environment."
            },
            "panel.register.headline": {
                "dpuk": "Join a trusted research environment.",
                "serp": "Join a trusted research environment."
            },
            "panel.register.subtext": {
                "dpuk": "Register to request access to projects and collaborate securely with your research team.",
                "serp": "Register to request access to projects and collaborate securely with your research team."
            },
            "panel.login-reset-password.headline": {
                "dpuk": "Let's get you back in.",
                "serp": "Let's get you back in."
            },
            "panel.login-reset-password.subtext": {
                "dpuk": "Reset your password securely — your projects and data stay protected while you do.",
                "serp": "Reset your password securely — your projects and data stay protected while you do."
            },
            "panel.login-otp.headline": {
                "dpuk": "One more step to keep your account safe.",
                "serp": "One more step to keep your account safe."
            },
            "panel.login-otp.subtext": {
                "dpuk": "Two-step verification makes sure it's really you, even if someone else knows your password.",
                "serp": "Two-step verification makes sure it's really you, even if someone else knows your password."
            },
            "panel.login-update-password.headline": {
                "dpuk": "Time for a fresh password.",
                "serp": "Time for a fresh password."
            },
            "panel.login-update-password.subtext": {
                "dpuk": "Your administrator has asked you to set a new password before continuing.",
                "serp": "Your administrator has asked you to set a new password before continuing."
            },
            "panel.login-verify-email.headline": {
                "dpuk": "Check your inbox.",
                "serp": "Check your inbox."
            },
            "panel.login-verify-email.subtext": {
                "dpuk": "Confirming your email lets us recover your account and send you important security notices.",
                "serp": "Confirming your email lets us recover your account and send you important security notices."
            },
            "panel.terms.headline": {
                "dpuk": "Before you get started.",
                "serp": "Before you get started."
            },
            "panel.terms.subtext": {
                "dpuk": "Please review and accept our terms to continue to your account.",
                "serp": "Please review and accept our terms to continue to your account."
            },
            "panel.login-page-expired.headline": {
                "dpuk": "Let's pick up where you left off.",
                "serp": "Let's pick up where you left off."
            },
            "panel.login-page-expired.subtext": {
                "dpuk": "For your security, sign-in pages time out after a period of inactivity.",
                "serp": "For your security, sign-in pages time out after a period of inactivity."
            },
            "pageExpiredTitle": {
                "dpuk": "This page has expired",
                "serp": "This page has expired"
            },
            "pageExpiredInstruction": {
                "dpuk": "You were away for a while, or the link you followed is no longer valid. Nothing was lost.",
                "serp": "You were away for a while, or the link you followed is no longer valid. Nothing was lost."
            },
            "pageExpiredContinue": {
                "dpuk": "Continue signing in",
                "serp": "Continue signing in"
            },
            "pageExpiredRestart": {
                "dpuk": "Start over",
                "serp": "Start over"
            }
        }
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
