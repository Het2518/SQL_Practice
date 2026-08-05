import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg text-text text-center p-6">
      <div className="text-6xl font-black text-primary mb-4 animate-pulse">404</div>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-text-secondary mb-8 max-w-md">
        The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>
      <Button onClick={() => navigate('/')} size="lg">
        Return Home
      </Button>
    </div>
  );
}
