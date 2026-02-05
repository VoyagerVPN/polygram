import {
  setDebug,
  mountThemeParams,
  bindThemeParamsCssVars,
  restoreInitData,
  mountViewport,
  bindViewportCssVars,
  init as initSDK,
  mockTelegramEnv,
  retrieveLaunchParams,
  emitEvent,
  mountMiniApp,
  bindMiniAppCssVars,
  mountBackButton,
  isMiniAppSupported,
  miniAppReady,
} from '@telegram-apps/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  // Set @telegram-apps/sdk-react debug mode and initialize it.
  setDebug(options.debug);
  initSDK();

  // Add Eruda if needed (only in development).
  if (import.meta.env.DEV && options.eruda) {
    void import('eruda').then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: 0 });
    });
  }

  // Telegram for macOS has a ton of bugs, including cases, when the client doesn't
  // even response to the "web_app_request_theme" method. It also generates an incorrect
  // event for the "web_app_request_safe_area" method.
  if (options.mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event) {
        const [methodName] = event;

        if (methodName === 'web_app_request_theme') {
          const themeParams = firstThemeSent
            ? undefined
            : retrieveLaunchParams().tgWebAppThemeParams;
          firstThemeSent = true;
          emitEvent('theme_changed', { theme_params: themeParams ?? {} });
          return;
        }

        if (methodName === 'web_app_request_safe_area') {
          emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
          return;
        }
      },
    });
  }

  // Mount all components used in the project.
  mountBackButton();
  restoreInitData();

  if (isMiniAppSupported()) {
    mountMiniApp();
    mountThemeParams();
    bindThemeParamsCssVars();
    bindMiniAppCssVars();
    miniAppReady();
  }

  await mountViewport();
  bindViewportCssVars();
}
