import { Router } from 'express'
import { prisma } from '../index.js'
import { authenticate, staffOnly } from '../middleware/auth.js'
const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const { series, speaker, featured, limit } = req.query
    const where = { status: 'published' }
    if (series) where.series = series
    if (speaker) where.speaker = { contains: speaker }
    if (featured === 'true') where.featured = true
    const sermons = await prisma.sermon.findMany({
      where, orderBy: { date: 'desc' },
      take: limit ? parseInt(limit) : undefined
    })
    res.json({ sermons })
  } catch (err) { next(err) }
})

router.get('/all', authenticate, staffOnly, async (req, res, next) => {
  try {
    const sermons = await prisma.sermon.findMany({ orderBy: { date: 'desc' } })
    res.json({ sermons })
  } catch (err) { next(err) }
})

router.get('/series', async (req, res, next) => {
  try {
    const series = await prisma.sermon.groupBy({ by: ['series'], where: { series: { not: null } }, _count: true })
    res.json({ series })
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const sermon = await prisma.sermon.findUnique({ where: { id: req.params.id } })
    if (!sermon) return res.status(404).json({ error: 'Sermon not found' })
    await prisma.sermon.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } })
    res.json({ sermon })
  } catch (err) { next(err) }
})

router.post('/', authenticate, staffOnly, async (req, res, next) => {
  try {
    const sermon = await prisma.sermon.create({ data: { ...req.body, date: new Date(req.body.date) } })
    res.status(201).json({ sermon })
  } catch (err) { next(err) }
})

router.put('/:id', authenticate, staffOnly, async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (data.date) data.date = new Date(data.date)
    const sermon = await prisma.sermon.update({ where: { id: req.params.id }, data })
    res.json({ sermon })
  } catch (err) { next(err) }
})

router.delete('/:id', authenticate, staffOnly, async (req, res, next) => {
  try {
    await prisma.sermon.delete({ where: { id: req.params.id } })
    res.json({ message: 'Sermon deleted' })
  } catch (err) { next(err) }
})
export default router
