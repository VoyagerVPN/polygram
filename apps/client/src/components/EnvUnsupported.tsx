import { Placeholder } from '@telegram-apps/telegram-ui';
import { retrieveLaunchParams, isColorDark, isRGB } from '@telegram-apps/sdk-react';
import { useMemo } from 'react';

export function EnvUnsupported({ error }: { error?: unknown }) {
  const hostname = window.location.hostname;
  const [isDark] = useMemo(() => {
    // ... (rest of the logic remains same, just adding error display)
    try {
      const lp = retrieveLaunchParams();
      const { tgWebAppThemeParams: themeParams } = lp;
      const bgColor = themeParams?.bg_color;
      return [
        bgColor && isRGB(bgColor) ? isColorDark(bgColor) : false,
      ];
    } catch {
      return [false];
    }
  }, []);

  return (
    <div
      className={isDark ? 'dark' : 'light'}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'var(--tg-theme-bg-color, #0b0e11)', color: 'white', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}
    >
      <Placeholder
        header="Oops"
        description="Environment initialization failed"
      >
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{ display: 'block', width: '144px', height: '144px', margin: '0 auto' }}
        />
      </Placeholder>
      
      <div style={{ marginTop: '20px', fontSize: '12px', opacity: 0.6, maxWidth: '300px', wordBreak: 'break-all' }}>
        <p>Host: {hostname}</p>
        <p>Error: {error?.message || String(error) || 'Unknown error'}</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
