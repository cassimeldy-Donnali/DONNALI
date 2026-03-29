import { useEffect, useRef } from 'react';
import { Bell, CheckCheck, PackageCheck, Unlock, Star, Clock, Info, X } from 'lucide-react';
import type { Notification } from '../../hooks/useNotifications';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  contact_unlocked: <Unlock className="w-4 h-4 text-ocean-500" />,
  listing_validated: <PackageCheck className="w-4 h-4 text-green-500" />,
  rating_received: <Star className="w-4 h-4 text-yellow-500" />,
  listing_expiring: <Clock className="w-4 h-4 text-orange-500" />,
  transaction_validated: <CheckCheck className="w-4 h-4 text-green-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
};

const TYPE_BG: Record<string, string> = {
  contact_unlocked: 'bg-ocean-50',
  listing_validated: 'bg-green-50',
  rating_received: 'bg-yellow-50',
  listing_expiring: 'bg-orange-50',
  transaction_validated: 'bg-green-50',
  info: 'bg-blue-50',
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'A l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Il y a ${days}j`;
}

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  open: boolean;
  onToggle: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationBell({ unreadCount, onClick }: { unreadCount: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center px-1">
          <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
        </span>
      )}
    </button>
  );
}

export function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
  onClose,
}: Omit<NotificationCenterProps, 'open' | 'onToggle'>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scale-in"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-700" />
          <span className="font-semibold text-sm text-gray-900">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded-full">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tout lire
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Aucune notification</p>
          </div>
        ) : (
          <ul>
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => onMarkRead(n.id)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${TYPE_BG[n.type] ?? 'bg-gray-100'}`}>
                    {TYPE_ICONS[n.type] ?? <Info className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-tight ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                      {!n.is_read && <span className="w-2 h-2 bg-ocean-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
