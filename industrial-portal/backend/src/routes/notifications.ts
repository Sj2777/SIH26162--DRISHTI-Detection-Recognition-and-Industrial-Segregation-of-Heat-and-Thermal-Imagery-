import { Router, Request, Response } from 'express';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../notifications/notificationService';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json(listNotifications());
});

router.post('/read-all', (_req: Request, res: Response) => {
  res.status(200).json({ notifications: markAllNotificationsRead() });
});

router.post('/:id/read', (req: Request, res: Response) => {
  const notification = markNotificationRead(String(req.params.id));
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  return res.status(200).json(notification);
});

export default router;