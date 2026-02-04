import { Placeholder } from '@telegram-apps/telegram-ui';
import { retrieveLaunchParams, isColorDark, isRGB } from '@telegram-apps/sdk-react';
import { useMemo } from 'react';

export function EnvUnsupported() {
  const [isDark] = useMemo(() => {
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
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--tg-theme-bg-color, #0b0e11)' }}
    >
      <Placeholder
        header="Oops"
        description="You are using too old Telegram client to run this application"
      >
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{ display: 'block', width: '144px', height: '144px' }}
        />
      </Placeholder>
    </div>
  );
}
