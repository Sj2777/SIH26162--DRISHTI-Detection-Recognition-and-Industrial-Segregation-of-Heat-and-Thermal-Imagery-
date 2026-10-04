export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface PortalNotification {
  id: string;
  createdAt: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  incidentId: string;
  facilityId?: string;
  assetId?: string;
  read: boolean;
  channel: 'DEMO_IN_APP';
}

export interface NotificationAdapter {
  send(notification: PortalNotification): void | Promise<void>;
  list(): PortalNotification[];
  markRead(id: string): PortalNotification | undefined;
  markAllRead(): PortalNotification[];
}

export class InMemoryDemoAdapter implements NotificationAdapter {
  private notifications: PortalNotification[] = [];

  send(notification: PortalNotification): void {
    if (this.notifications.some((item) => item.id === notification.id)) return;
    this.notifications.push({ ...notification });
    if (this.notifications.length > 100) this.notifications.splice(0, this.notifications.length - 100);
  }

  list(): PortalNotification[] {
    return this.notifications.slice().reverse().map((notification) => ({ ...notification }));
  }

  markRead(id: string): PortalNotification | undefined {
    const notification = this.notifications.find((item) => item.id === id);
    if (!notification) return undefined;
    notification.read = true;
    return { ...notification };
  }

  markAllRead(): PortalNotification[] {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
    return this.list();
  }
}