import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ThemeEffect } from '@/features/settings';
import { router } from '@/routes/router';

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          <ThemeEffect />
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
