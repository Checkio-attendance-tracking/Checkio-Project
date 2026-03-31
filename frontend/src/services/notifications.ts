import api from "./api";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  metadata?: unknown;
  readAt?: string | null;
  createdAt: string;
};

export type ListNotificationsResponse = {
  items: NotificationItem[];
  unreadCount: number;
};

export const notificationService = {
  async list(params?: { unread?: boolean; limit?: number; offset?: number }) {
    const response = await api.get<ListNotificationsResponse>("/notificaciones", {
      params: {
        unread: params?.unread ? "1" : undefined,
        limit: params?.limit ?? 20,
        offset: params?.offset ?? 0,
      },
    });
    return response.data;
  },

  async markRead(id: string) {
    const response = await api.post<NotificationItem>(`/notificaciones/${id}/read`);
    return response.data;
  },

  async markAllRead() {
    const response = await api.post<{ updated: number }>("/notificaciones/read-all");
    return response.data;
  },
};

