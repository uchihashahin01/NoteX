import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { Download, X, RefreshCw, CheckCircle } from 'lucide-react';

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error' | 'up-to-date';

export default function UpdateChecker() {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [version, setVersion] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check for updates 3 seconds after app launch
    const timer = setTimeout(() => {
      checkForUpdate();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const checkForUpdate = async () => {
    try {
      setStatus('checking');
      const update = await check();
      if (update) {
        setVersion(update.version);
        setStatus('available');
      } else {
        setStatus('up-to-date');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (err) {
      console.error('Update check failed:', err);
      setError(String(err));
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const installUpdate = async () => {
    try {
      setStatus('downloading');
      const update = await check();
      if (!update) return;

      let totalBytes = 0;
      let downloadedBytes = 0;

      await update.downloadAndInstall((event) => {
        if (event.event === 'Started' && event.data.contentLength) {
          totalBytes = event.data.contentLength;
        } else if (event.event === 'Progress') {
          downloadedBytes += event.data.chunkLength;
          if (totalBytes > 0) {
            setProgress(Math.round((downloadedBytes / totalBytes) * 100));
          }
        } else if (event.event === 'Finished') {
          setStatus('ready');
        }
      });

      setStatus('ready');
    } catch (err) {
      console.error('Update install failed:', err);
      setError(String(err));
      setStatus('error');
    }
  };

  const handleRelaunch = async () => {
    await relaunch();
  };

  if (status === 'idle' || dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        minWidth: '320px',
        maxWidth: '400px',
        color: 'var(--text-primary)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Close button */}
      {(status === 'available' || status === 'error' || status === 'up-to-date') && (
        <button
          onClick={() => setDismissed(true)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      )}

      {status === 'checking' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '14px' }}>Checking for updates...</span>
        </div>
      )}

      {status === 'up-to-date' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle size={20} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '14px' }}>You're up to date!</span>
        </div>
      )}

      {status === 'available' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Download size={20} style={{ color: '#6366f1' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Update Available</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Version {version} is ready to download
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={installUpdate}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Download & Install
            </button>
            <button
              onClick={() => setDismissed(true)}
              style={{
                padding: '8px 16px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}

      {status === 'downloading' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
            <span style={{ fontSize: '14px' }}>Downloading update... {progress}%</span>
          </div>
          <div
            style={{
              height: '6px',
              background: 'var(--bg-tertiary)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <CheckCircle size={20} style={{ color: '#22c55e' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Update Ready</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Restart NoteX to apply the update
              </div>
            </div>
          </div>
          <button
            onClick={handleRelaunch}
            style={{
              width: '100%',
              padding: '8px 16px',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Restart Now
          </button>
        </div>
      )}

      {status === 'error' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <X size={20} style={{ color: '#ef4444' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Update Failed</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
              {error || 'Could not check for updates'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
