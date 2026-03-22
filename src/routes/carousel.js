import { Router } from 'express'
import { prisma } from '../index.js'
import { authenticate, adminOnly, staffOnly } from '../middleware/auth.js'
const router = Router()

// GET /api/carousel — public, only live slides
router.get('/', async (req, res, next) => {
  try {
    const slides = await prisma.carouselSlide.findMany({
      where: { status: 'live' },
      orderBy: { order: 'asc' }
    })
    res.json({ slides })
  } catch (err) { next(err) }
})

// GET /api/carousel/all — admin, all slides
router.get('/all', authenticate, staffOnly, async (req, res, next) => {
  try {
    const slides = await prisma.carouselSlide.findMany({ orderBy: { order: 'asc' } })
    res.json({ slides })
  } catch (err) { next(err) }
})

// POST /api/carousel — create slide
router.post('/', authenticate, staffOnly, async (req, res, next) => {
  try {
    const slide = await prisma.carouselSlide.create({ data: req.body })
    res.status(201).json({ slide })
  } catch (err) { next(err) }
})

// PUT /api/carousel/:id — update slide
router.put('/:id', authenticate, staffOnly, async (req, res, next) => {
  try {
    const slide = await prisma.carouselSlide.update({ where: { id: req.params.id }, data: req.body })
    res.json({ slide })
  } catch (err) { next(err) }
})

// PUT /api/carousel/reorder — bulk reorder
router.put('/reorder/bulk', authenticate, staffOnly, async (req, res, next) => {
  try {
    const { order } = req.body // [{ id, order }]
    await Promise.all(order.map(({ id, order }) => prisma.carouselSlide.update({ where: { id }, data: { order } })))
    res.json({ message: 'Reordered successfully' })
  } catch (err) { next(err) }
})

// DELETE /api/carousel/:id
router.delete('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    await prisma.carouselSlide.delete({ where: { id: req.params.id } })
    res.json({ message: 'Slide deleted' })
  } catch (err) { next(err) }
})
export default router
