import { useNavigate } from 'react-router-dom';
import { backButton } from '@tma.js/sdk-react';
import { type PropsWithChildren, useEffect } from 'react';

interface PageProps {
  back?: boolean;
  className?: string;
}

export function Page({ 
  children, 
  back = true, 
  className = '' 
}: PropsWithChildren<PageProps>) {
  const navigate = useNavigate();

  useEffect(() => {
    if (back) {
      backButton.show();
      return backButton.onClick(() => {
        navigate(-1);
      });
    }
    backButton.hide();
  }, [back]);

  return (
    <div className={`min-h-screen ${className}`}>
      {children}
    </div>
  );
}
