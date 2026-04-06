import { createContext } from 'react';

export interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ToastContext = createContext<ToastContextType>({ toast: () => {} });
