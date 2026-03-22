import { Router } from 'express'
import { prisma } from '../index.js'
import { authenticate, adminOnly, staffOnly } from '../middleware/auth.js'
const router = Router()

router.get('/', authenticate, staffOnly, async (req, res, next) => {
  try {
    const { ministry, status, search } = req.query
    const where = {}
    if (ministry) where.ministry = ministry
    if (status) where.user = { status }
    if (search) where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { user: { email: { contains: search } } }
    ]
    const members = await prisma.member.findMany({
      where, include: { user: { select: { id: true, email: true, role: true, status: true, lastLoginAt: true } } },
      orderBy: { firstName: 'asc' }
    })
    res.json({ members })
  } catch (err) { next(err) }
})

router.get('/me', authenticate, async (req, res) => {
  res.json({ member: req.user.member, user: { id: req.user.id, email: req.user.email, role: req.user.role } })
})

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const isOwnProfile = req.user.member?.id === req.params.id
    const isStaff = ['ADMIN','PASTOR','DEACON'].includes(req.user.role)
    if (!isOwnProfile && !isStaff) return res.status(403).json({ error: 'Access denied' })
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { email: true, role: true, status: true } } }
    })
    if (!member) return res.status(404).json({ error: 'Member not found' })
    if (!isStaff) delete member.notes // Hide pastoral notes
    res.json({ member })
  } catch (err) { next(err) }
})

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const isOwnProfile = req.user.member?.id === req.params.id
    const isStaff = ['ADMIN','PASTOR'].includes(req.user.role)
    if (!isOwnProfile && !isStaff) return res.status(403).json({ error: 'Access denied' })
    const { notes, ...safeData } = req.body
    const data = isStaff ? req.body : safeData // Only staff can update notes
    const member = await prisma.member.update({ where: { id: req.params.id }, data })
    res.json({ member })
  } catch (err) { next(err) }
})

// Admin: approve / suspend / change role
router.patch('/:id/status', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { status, role } = req.body
    const member = await prisma.member.findUnique({ where: { id: req.params.id } })
    if (!member) return res.status(404).json({ error: 'Member not found' })
    await prisma.user.update({ where: { id: member.userId }, data: { ...(status && { status }), ...(role && { role }) } })
    res.json({ message: 'Member status updated' })
  } catch (err) { next(err) }
})

router.delete('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const member = await prisma.member.findUnique({ where: { id: req.params.id } })
    if (!member) return res.status(404).json({ error: 'Member not found' })
    await prisma.user.delete({ where: { id: member.userId } }) // Cascades to member
    res.json({ message: 'Member account deleted' })
  } catch (err) { next(err) }
})
export default router
