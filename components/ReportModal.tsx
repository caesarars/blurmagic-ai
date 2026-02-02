import React, { useState } from 'react';
import { reportContent } from '../services/safetyService';
import { useToast } from '../contexts/ToastContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const reportReasons = [
    { value: 'csam', label: 'Child sexual abuse material (CSAM)', severity: 'critical' },
    { value: 'non-consensual', label: 'Non-consensual intimate imagery', severity: 'critical' },
    { value: 'violence', label: 'Extreme violence or gore', severity: 'high' },
    { value: 'illegal', label: 'Illegal activity', severity: 'high' },
    { value: 'ownership', label: 'I don\'t own the rights to this content', severity: 'medium' },
    { value: 'other', label: 'Other violation', severity: 'medium' },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);
    
    try {
      await reportContent(reason, details);
      addToast('Report submitted. Thank you for helping keep our community safe.', 'success');
      onClose();
      
      // Reset form
      setReason('');
      setDetails('');
    } catch (error) {
      addToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReason = reportReasons.find(r => r.value === reason);
  const isCritical = selectedReason?.severity === 'critical';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Report Content</h2>
              <p className="text-sm text-slate-400">Help us keep the platform safe</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isCritical && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm font-bold flex items-center gap-2">
                <span>🚨</span>
                This will be reported to authorities immediately
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reason for report *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a reason...</option>
              {reportReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Provide any additional context..."
              className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason || isSubmitting}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            False reports may result in account suspension. 
            Emergency? Contact local authorities immediately.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
