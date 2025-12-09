import { AlertCircle, X } from "lucide-react";

interface ErrorMessageProps {
  message: string | null | undefined;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  variant?: "error" | "warning" | "info";
  testId?: string;
}
/* comentario */
export function ErrorMessage({
  message,
  title = "Error",
  dismissible = false,
  onDismiss,
  className = "",
  variant = "error",
  testId = "error-message",
}: ErrorMessageProps) {
  if (!message) return null;

  const variantStyles = {
    error: "bg-red-500/20 border-red-500 text-red-300",
    warning: "bg-yellow-500/20 border-yellow-500 text-yellow-300",
    info: "bg-blue-500/20 border-blue-500 text-blue-300",
  };

  const iconColor = {
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };

  return (
    <div
      className={`mb-4 p-4 border rounded-lg flex items-start gap-3 ${variantStyles[variant]} ${className}`}
      data-testid={testId}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle
        size={20}
        className={`flex-shrink-0 mt-0.5 ${iconColor[variant]}`}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold mb-1 text-sm">{title}</h3>}
        <p className="text-sm break-words">{message}</p>
      </div>

      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-md hover:bg-white/11 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Dismiss error message"
          type="button"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
