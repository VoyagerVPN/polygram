import { emitEvent, isTMA, mockTelegramEnv } from '@telegram-apps/sdk-react';

// Extend Window interface for Telegram WebApp
// Required for @telegram-apps/telegram-ui compatibility
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        colorScheme: 'light' | 'dark';
        onEvent: (event: string, callback: () => void) => void;
        offEvent: (event: string, callback: () => void) => void;
      };
    };
  }
}

// It is important, to mock the environment only for development purposes. When building the
// application, import.meta.env.DEV will become false, and the code inside will be tree-shaken,
// but we keep it for localhost to allow testing production-like builds.
const isTunnel = window.location.hostname.includes('cloudpub.ru') || window.location.hostname.includes('trycloudflare.com');

if (import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || isTunnel) {
  // Always log attempt
  console.log('[MockEnv] Checking environment...', { isTMA: isTMA(), isTunnel });
  
  if (!isTMA() || isTunnel) {
    console.log('[MockEnv] Applying Telegram mock environment');
    const themeParams = {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    } as const;
    const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

    // Environment mocking is handled by mockTelegramEnv below.
    // Manual window.Telegram mock is removed to avoid conflicts with @telegram-apps/sdk-react.

    mockTelegramEnv({
      launchParams: {
        tgWebAppThemeParams: themeParams,
        tgWebAppData: new URLSearchParams([
          ['user', JSON.stringify({ id: 1, first_name: 'Vladislav' })],
          ['hash', 'some-hash'],
          ['signature', 'some-signature'],
          ['auth_date', (Date.now() / 1000 | 0).toString()],
        ]).toString(),
        tgWebAppStartParam: 'debug',
        tgWebAppVersion: '8.4',
        tgWebAppPlatform: 'tdesktop',
      },
      onEvent(event) {
        // event is a tuple: [methodName, params]
        const [methodName] = event;

        // Handle theme request
        if (methodName === 'web_app_request_theme') {
          emitEvent('theme_changed', { theme_params: themeParams });
          return;
        }

        // Handle viewport request
        if (methodName === 'web_app_request_viewport') {
          emitEvent('viewport_changed', {
            height: window.innerHeight,
            width: window.innerWidth,
            is_expanded: true,
            is_state_stable: true,
          });
          return;
        }

        // Handle content safe area request
        if (methodName === 'web_app_request_content_safe_area') {
          emitEvent('content_safe_area_changed', noInsets);
          return;
        }

        // Handle safe area request
        if (methodName === 'web_app_request_safe_area') {
          emitEvent('safe_area_changed', noInsets);
          return;
        }
      },
    });

    console.info(
      '⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.',
    );
  }
}
