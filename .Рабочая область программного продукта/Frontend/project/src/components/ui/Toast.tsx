import { X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const Toast = () => {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {toasts.map((toast) => {
        let bgColor = 'bg-gray-800';
        if (toast.type === 'success') bgColor = 'bg-green-600';
        if (toast.type === 'error') bgColor = 'bg-red-600';
        if (toast.type === 'info') bgColor = 'bg-blue-600';

        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between max-w-md w-full animate-fade-in`}
          >
            <p>{toast.message}</p>
            <button
              onClick={() => hideToast(toast.id)}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;