import { Router } from 'express'
import { prisma } from '../index.js'
import { authenticate, staffOnly } from '../middleware/auth.js'
const router = Router()

router.get('/', authenticate, staffOnly, async (req, res, next) => {
  try {
    const notifs = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' } })
    res.json({ notifications: notifs })
  } catch (err) { next(err) }
})

router.post('/', authenticate, staffOnly, async (req, res, next) => {
  try {
    const { scheduledAt, ...data } = req.body
    const notif = await prisma.notification.create({
      data: {
        ...data,
        status: scheduledAt ? 'scheduled' : 'sent',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sentAt: scheduledAt ? null : new Date(),
      }
    })
    res.status(201).json({ notification: notif, message: scheduledAt ? 'Notification scheduled' : 'Notification sent' })
  } catch (err) { next(err) }
})

router.put('/:id', authenticate, staffOnly, async (req, res, next) => {
  try {
    const notif = await prisma.notification.update({ where: { id: req.params.id }, data: req.body })
    res.json({ notification: notif })
  } catch (err) { next(err) }
})

router.delete('/:id', authenticate, staffOnly, async (req, res, next) => {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
})
export default router
