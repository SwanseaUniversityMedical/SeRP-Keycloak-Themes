import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

export default function LoginPageExpired(
    props: PageProps<Extract<KcContext, { pageId: "login-page-expired.ftl" }>, I18n>
) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
    const { url } = kcContext;
    const { msg, advancedMsgStr } = i18n;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={msg("pageExpiredTitle")}
        >
            <p className="kc-instruction">{advancedMsgStr("pageExpiredInstruction")}</p>
            <div className="kc-form-buttons">
                <a
                    id="loginContinueLink"
                    href={url.loginAction}
                    className="kc-btn kc-btn--primary kc-btn--block"
                >
                    {advancedMsgStr("pageExpiredContinue")}
                </a>
                <a
                    id="loginRestartLink"
                    href={url.loginRestartFlowUrl}
                    className="kc-btn kc-btn--secondary kc-btn--block"
                >
                    {advancedMsgStr("pageExpiredRestart")}
                </a>
            </div>
        </Template>
    );
}
