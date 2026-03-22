import { Router } from 'express'
import { prisma } from '../index.js'
import { authenticate, adminOnly, staffOnly } from '../middleware/auth.js'
const router = Router()

router.get('/', authenticate, staffOnly, async (req, res, next) => {
  try {
    const { fund, month, year } = req.query
    const where = {}
    if (fund) where.fund = fund
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1)
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      where.date = { gte: start, lte: end }
    }
    const records = await prisma.givingRecord.findMany({ where, orderBy: { date: 'desc' } })
    const totals = await prisma.givingRecord.groupBy({ by: ['fund'], _sum: { amount: true }, where })
    res.json({ records, totals })
  } catch (err) { next(err) }
})

router.get('/summary', authenticate, staffOnly, async (req, res, next) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthly = await prisma.givingRecord.aggregate({
      where: { date: { gte: startOfMonth } }, _sum: { amount: true }
    })
    const byFund = await prisma.givingRecord.groupBy({
      by: ['fund'], where: { date: { gte: startOfMonth } }, _sum: { amount: true }
    })
    res.json({ monthlyTotal: monthly._sum.amount || 0, byFund })
  } catch (err) { next(err) }
})

router.post('/', authenticate, staffOnly, async (req, res, next) => {
  try {
    const record = await prisma.givingRecord.create({
      data: { ...req.body, date: req.body.date ? new Date(req.body.date) : new Date() }
    })
    res.status(201).json({ record })
  } catch (err) { next(err) }
})

router.delete('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    await prisma.givingRecord.delete({ where: { id: req.params.id } })
    res.json({ message: 'Record deleted' })
  } catch (err) { next(err) }
})
export default router
