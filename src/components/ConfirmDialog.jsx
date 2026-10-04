import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-2xl shrink-0 ${
            danger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 ${
            danger
              ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
              : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
          }`}
        >
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
