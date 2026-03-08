import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((icon, msg, sub) => {
    setToast({ icon, msg, sub, show: true });
    setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.show ? 'show' : ''}`}>
            <div className="toast-icon">{toast.icon}</div>
            <div>
              <div className="toast-msg">{toast.msg}</div>
              <div className="toast-sub">{toast.sub}</div>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
