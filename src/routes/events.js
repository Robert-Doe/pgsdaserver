import { Router } from 'express'
import { prisma } from '../index.js'
import { authenticate, staffOnly } from '../middleware/auth.js'
const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const { upcoming, category, featured } = req.query
    const where = { status: 'published' }
    if (upcoming === 'true') where.date = { gte: new Date() }
    if (category) where.category = category
    if (featured === 'true') where.featured = true
    const events = await prisma.event.findMany({ where, orderBy: { date: 'asc' } })
    res.json({ events })
  } catch (err) { next(err) }
})

router.get('/all', authenticate, staffOnly, async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: 'asc' } })
    res.json({ events })
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } })
    if (!event) return res.status(404).json({ error: 'Event not found' })
    res.json({ event })
  } catch (err) { next(err) }
})

router.post('/', authenticate, staffOnly, async (req, res, next) => {
  try {
    const event = await prisma.event.create({ data: { ...req.body, date: new Date(req.body.date) } })
    res.status(201).json({ event })
  } catch (err) { next(err) }
})

router.put('/:id', authenticate, staffOnly, async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (data.date) data.date = new Date(data.date)
    const event = await prisma.event.update({ where: { id: req.params.id }, data })
    res.json({ event })
  } catch (err) { next(err) }
})

router.delete('/:id', authenticate, staffOnly, async (req, res, next) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } })
    res.json({ message: 'Event deleted' })
  } catch (err) { next(err) }
})
export default router
