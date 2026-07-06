import React, { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SocialVerifyButton({ platform, connectorId, onVerified, isVerified }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    // Step 1: Get the OAuth URL
    let url;
    try {
      url = await base44.connectors.connectAppUser(connectorId);
    } catch (err) {
      setError(`Couldn't start ${platform} connection. Please try again.`);
      setLoading(false);
      return;
    }

    // Step 2: Open OAuth popup
    const popup = window.open(url, '_blank', 'width=600,height=700');
    if (!popup) {
      setError(`Popup was blocked. Allow popups for this site, then click again.`);
      setLoading(false);
      return;
    }

    // Step 3: Poll for popup close, then sync
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        // Step 4: Sync data from backend (onVerified shows its own toasts)
        Promise.resolve(onVerified?.())
          .catch(() => { /* error toast already shown by sync fn */ })
          .finally(() => setLoading(false));
      }
    }, 500);
  };

  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
        <CheckCircle className="w-3.5 h-3.5" /> Verified
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="text-xs text-primary font-medium hover:underline disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
            Connecting…
          </>
        ) : (
          'Connect to verify →'
        )}
      </button>
      {error && (
        <span className="text-xs text-destructive flex items-center gap-1 max-w-[220px] text-right">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </span>
      )}
    </div>
  );
}