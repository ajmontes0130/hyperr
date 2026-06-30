import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SocialVerifyButton({ platform, connectorId, onVerified, isVerified }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await base44.connectors.connectAppUser(connectorId);
      const popup = window.open(url, '_blank', 'width=600,height=700');
      
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setLoading(false);
          onVerified();
        }
      }, 500);
    } catch (error) {
      console.error('Connection error:', error);
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
        <CheckCircle className="w-3.5 h-3.5" /> Verified
      </span>
    );
  }

  return (
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
  );
}