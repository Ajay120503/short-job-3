import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'info'
  isLoading = false,
  requireTyping = null, // pass a string to require the user to type it
}) => {
  const [typedText, setTypedText] = useState("");

  if (!isOpen) return null;

  const canConfirm = requireTyping ? typedText === requireTyping : true;

  const variantStyles = {
    danger: {
      icon: "text-error",
      confirmBtn: "btn-error",
      bg: "bg-error/10",
    },
    warning: {
      icon: "text-warning",
      confirmBtn: "btn-warning",
      bg: "bg-warning/10",
    },
    info: {
      icon: "text-info",
      confirmBtn: "btn-info",
      bg: "bg-info/10",
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="z-app-modal fixed inset-0 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
          disabled={isLoading}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-full ${styles.bg} flex items-center justify-center mx-auto mb-4`}
        >
          <AlertTriangle className={`w-7 h-7 ${styles.icon}`} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold font-heading text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-sm text-base-content/60 text-center mb-6 leading-relaxed">
          {message}
        </p>

        {/* Typing confirmation */}
        {requireTyping && (
          <div className="mb-6">
            <p className="text-xs text-base-content/50 mb-2 text-center">
              Type{" "}
              <span className="font-bold text-error">"{requireTyping}"</span> to
              confirm:
            </p>
            <input
              type="text"
              className="input input-bordered w-full h-10 text-sm text-center"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={requireTyping}
              autoFocus
              disabled={isLoading}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn btn-ghost flex-1 h-11"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              if (canConfirm) {
                onConfirm();
                setTypedText("");
              }
            }}
            className={`btn ${styles.confirmBtn} flex-1 h-11`}
            disabled={!canConfirm || isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
