import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationService, type NotificationItem } from "../services/notifications";

type NotificationBellProps = {
  className?: string;
  limit?: number;
  variant?: "popover" | "sheet";
};

export function NotificationBell({ className, limit = 8, variant = "popover" }: NotificationBellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const panelId = useMemo(() => `notifications-${Math.random().toString(36).slice(2)}`, []);
  const titleId = `${panelId}-title`;

  const badgeText = useMemo(() => {
    if (unreadCount <= 0) return "";
    return unreadCount > 99 ? "99+" : String(unreadCount);
  }, [unreadCount]);

  const refresh = useCallback(async (opts?: { unreadOnly?: boolean }) => {
    setLoading(true);
    try {
      const res = await notificationService.list({ unread: opts?.unreadOnly ?? false, limit, offset: 0 });
      setItems(res.items);
      setUnreadCount(res.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
    const id = window.setInterval(() => refresh({ unreadOnly: false }), 25000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (variant !== "popover") return;
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!rootRef.current) return;
      if (rootRef.current.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const container = panelRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () => {
      const selectors = [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(",");
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(selectors));
      return nodes.filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
    };

    const focusFirst = () => {
      const focusables = getFocusable();
      if (focusables.length > 0) focusables[0]!.focus();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = getFocusable();
      if (focusables.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;

      if (e.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!active || active === last || !container.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const id = window.setTimeout(focusFirst, 0);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused) previouslyFocused.focus();
    };
  }, [open]);

  const markRead = async (n: NotificationItem) => {
    if (n.readAt) return;
    try {
      const updated = await notificationService.markRead(n.id);
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const handleOpen = () => setOpen((v) => !v);

  const handleItemClick = async (n: NotificationItem) => {
    await markRead(n);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  const formatTs = (iso: string) => {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm} ${hh}:${mi}`;
  };

  const emptyText = loading ? "Cargando..." : "Sin notificaciones";

  const list = (
    <div className={variant === "sheet" ? "max-h-[60vh] overflow-y-auto" : "max-h-[420px] overflow-y-auto"}>
      {items.length === 0 ? (
        <div className="px-4 py-6 text-sm text-gray-500">{emptyText}</div>
      ) : (
        items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => handleItemClick(n)}
            className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${
              n.readAt ? "" : "bg-indigo-50/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="pt-1">
                <span
                  className={`block w-2 h-2 rounded-full ${n.readAt ? "bg-gray-200" : "bg-indigo-600"}`}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-semibold text-gray-900 leading-5">{n.title}</div>
                  <div className="text-[10px] text-gray-400 shrink-0">{formatTs(n.createdAt)}</div>
                </div>
                <div className="text-xs text-gray-600 mt-1 leading-4 break-words max-h-10 overflow-hidden">{n.body}</div>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );

  return (
    <div ref={rootRef} className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        aria-label="Notificaciones"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        <Bell size={20} />
        {badgeText && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
            {badgeText}
          </span>
        )}
      </button>

      {open && variant === "popover" && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <div id={titleId} className="text-sm font-semibold text-gray-900">
              Notificaciones
            </div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-gray-300"
              disabled={unreadCount === 0 || loading}
            >
              Marcar todas como leídas
            </button>
          </div>

          {list}
        </div>
      )}

      {open && variant === "sheet" && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Cerrar notificaciones"
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div id={titleId} className="text-sm font-semibold text-gray-900">
                Notificaciones
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pb-3 flex items-center justify-between border-b border-gray-100">
              <div className="text-xs text-gray-500">{unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}</div>
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-gray-300"
                disabled={unreadCount === 0 || loading}
              >
                Marcar todas como leídas
              </button>
            </div>

            {list}
          </div>
        </div>
      )}
    </div>
  );
}
