import { Router } from 'express'
import { prisma } from '../index.js'
import { authenticate, adminOnly } from '../middleware/auth.js'
const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } })
    const map = Object.fromEntries(settings.map(s => [s.key, s.value]))
    res.json({ settings: map, raw: settings })
  } catch (err) { next(err) }
})

router.put('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { settings } = req.body // { key: value, ... }
    await Promise.all(Object.entries(settings).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    ))
    res.json({ message: 'Settings saved' })
  } catch (err) { next(err) }
})
export default router
