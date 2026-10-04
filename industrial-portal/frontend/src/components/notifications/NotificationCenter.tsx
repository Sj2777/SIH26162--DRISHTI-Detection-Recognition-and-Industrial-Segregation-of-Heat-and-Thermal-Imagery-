import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PortalNotification } from '../../types';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/api';
import { RetryableError } from '../layout/RetryableError';
import { getUserFacingErrorMessage } from '../../utils/errorMessage';

const severityStyles = {
  critical: 'border-l-red-500 text-red-300',
  warning: 'border-l-orange-500 text-orange-300',
  success: 'border-l-emerald-500 text-emerald-300',
  info: 'border-l-cyan-500 text-cyan-300',
};

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [retryAction, setRetryAction] = useState<(() => Promise<void>) | null>(null);
  const mounted = useRef(false);
  const requestInFlight = useRef(false);

  const loadNotifications = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    if (mounted.current) setLoading(true);
    try {
      const items = await fetchNotifications();
      if (mounted.current) {
        setNotifications(items);
        setError(null);
        setRetryAction(null);
      }
    } catch (err) {
      if (mounted.current) {
        setError(getUserFacingErrorMessage(err, 'Notifications could not be loaded. Try again.'));
        setRetryAction(null);
      }
    } finally {
      requestInFlight.current = false;
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    let timeout: number | undefined;
    const schedulePoll = () => {
      if (!active || document.visibilityState !== 'visible') return;
      if (timeout !== undefined) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => void poll(), 10000);
    };
    const poll = async () => {
      if (!active) return;
      if (document.visibilityState === 'visible') await loadNotifications();
      schedulePoll();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (timeout !== undefined) window.clearTimeout(timeout);
        return;
      }
      if (timeout !== undefined) window.clearTimeout(timeout);
      void poll();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    void poll();
    return () => {
      active = false;
      mounted.current = false;
      if (timeout !== undefined) window.clearTimeout(timeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadNotifications]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleMarkRead = async (id: string) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await markNotificationRead(id);
      if (mounted.current) {
        setNotifications((current) => current.map((notification) =>
          notification.id === updated.id ? updated : notification));
        setRetryAction(null);
      }
    } catch (err) {
      if (mounted.current) {
        setError(getUserFacingErrorMessage(err, 'Notification could not be updated.'));
        setRetryAction(() => () => handleMarkRead(id));
      }
    } finally {
      if (mounted.current) setUpdating(false);
    }
  };

  const handleMarkAllRead = async () => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await markAllNotificationsRead();
      if (mounted.current) {
        setNotifications(updated);
        setRetryAction(null);
      }
    } catch (err) {
      if (mounted.current) {
        setError(getUserFacingErrorMessage(err, 'Notifications could not be updated.'));
        setRetryAction(() => handleMarkAllRead);
      }
    } finally {
      if (mounted.current) setUpdating(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        title="Notifications"
        onClick={() => setOpen((current) => !current)}
        className="relative flex items-center justify-center w-9 h-9 rounded border border-white/10 bg-[#0b0f15]/85 text-slate-200 hover:border-cyan-400/60 hover:text-cyan-300 transition-colors"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold font-mono">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="absolute right-0 top-full mt-2 z-50 w-[min(24rem,calc(100vw-1.5rem))] max-h-[min(70vh,34rem)] flex flex-col overflow-hidden rounded border border-[#2b3a4c] bg-[#101720] shadow-2xl">
          <header className="px-4 py-3 border-b border-[#263646]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-100">Notifications</h2>
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={updating || unreadCount === 0}
                className="text-[10px] font-mono text-cyan-300 hover:text-cyan-200 disabled:text-slate-600 disabled:cursor-not-allowed"
              >
                Mark all read
              </button>
            </div>
            <p className="text-[10px] font-mono text-[#7e90a5] mt-1">Demo notifications - no SMS or email is sent.</p>
          </header>

          <div className="overflow-y-auto">
            {loading && <p role="status" className="px-4 py-6 text-center text-xs font-mono text-[#94a3b8]">Loading notifications...</p>}
            {error && (
              <div className="mx-3 my-3">
                <RetryableError
                  message={error}
                  onRetry={() => void (retryAction ? retryAction() : loadNotifications())}
                  retrying={loading}
                />
              </div>
            )}
            {!loading && !error && notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-xs font-mono text-[#7e90a5]">No notifications</p>
            )}
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`border-l-2 ${severityStyles[notification.severity]} ${notification.read ? 'opacity-65' : 'bg-white/[0.025]'} border-b border-b-[#202c39] px-3 py-3`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-100">{notification.title}</p>
                    <p className="text-[11px] leading-relaxed text-[#aab8c7] mt-1 break-words">{notification.message}</p>
                    <p className="text-[9px] font-mono text-[#64748b] mt-2">
                      {notification.incidentId} · {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => void handleMarkRead(notification.id)}
                      disabled={updating}
                      className="shrink-0 text-[9px] font-mono text-cyan-300 hover:text-white disabled:opacity-50"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};