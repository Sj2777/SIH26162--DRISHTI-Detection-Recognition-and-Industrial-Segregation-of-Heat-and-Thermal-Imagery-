import fs from 'fs';
import path from 'path';
import {
  InMemoryDemoAdapter,
  NotificationAdapter,
  NotificationSeverity,
  PortalNotification,
} from './NotificationAdapter';

let notificationAdapter: NotificationAdapter = new InMemoryDemoAdapter();

// Keep incident callers on notify(); a real delivery adapter can replace this seam without changing those callers.
export const setNotificationAdapter = (adapter: NotificationAdapter): void => {
  notificationAdapter = adapter;
};

export const notify = async (notification: PortalNotification): Promise<void> => {
  try {
    await notificationAdapter.send(notification);
  } catch (error) {
    console.error('Notification adapter failed; incident action remains successful:', error);
  }
};

export const listNotifications = (): PortalNotification[] => notificationAdapter.list();

export const markNotificationRead = (id: string): PortalNotification | undefined =>
  notificationAdapter.markRead(id);

export const markAllNotificationsRead = (): PortalNotification[] => notificationAdapter.markAllRead();

const notificationSeverity = (severity: unknown): NotificationSeverity => {
  const normalized = typeof severity === 'string' ? severity.toUpperCase() : '';
  if (normalized === 'CRITICAL' || normalized === 'HIGH') return 'critical';
  if (normalized === 'MEDIUM' || normalized === 'WARNING') return 'warning';
  if (normalized === 'LOW') return 'info';
  return 'info';
};

const seedActiveAlertNotification = (): void => {
  try {
    const alertsPath = path.join(__dirname, '../../data/alerts.json');
    const alerts = JSON.parse(fs.readFileSync(alertsPath, 'utf-8')) as Array<Record<string, unknown>>;
    const alert = alerts.find((item) => item.status !== 'RESOLVED' && item.status !== 'CLOSED');
    if (!alert) return;

    const alertId = String(alert.id);
    const notification: PortalNotification = {
      id: `active-alert:${alertId}`,
      createdAt: new Date().toISOString(),
      severity: notificationSeverity(alert.severity),
      title: `${String(alert.type)} at ${String(alert.assetName)}`,
      message: String(alert.description),
      incidentId: alertId,
      ...(alert.assetId ? { assetId: String(alert.assetId) } : {}),
      read: false,
      channel: 'DEMO_IN_APP'
    };
    void notify(notification);
  } catch (error) {
    console.error('Could not seed active alert notification:', error);
  }
};

seedActiveAlertNotification();