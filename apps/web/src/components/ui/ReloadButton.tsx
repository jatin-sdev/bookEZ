'use client';

import { Button } from '@/components/ui/Button';

export const ReloadButton = () => {
  return (
    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
      Try Again
    </Button>
  );
};
