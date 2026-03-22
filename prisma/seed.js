// prisma/seed.js — Seed the database with starter data
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Phoenix Ghanaian SDA database...')

  // ── ADMIN USER ──
  const adminPassword = await bcrypt.hash('Admin@PGSDAchurch2026', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@phoenixghanaiansda.org' },
    update: {},
    create: {
      email: 'admin@phoenixghanaiansda.org',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      member: {
        create: {
          firstName: 'Church',
          lastName: 'Admin',
          ministry: 'Communications',
          memberSince: new Date('2020-01-01'),
        }
      }
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // ── PASTOR USER ──
  const pastorPassword = await bcrypt.hash('Pastor@PGSDA2026', 10)
  const pastor = await prisma.user.upsert({
    where: { email: 'pastor@phoenixghanaiansda.org' },
    update: {},
    create: {
      email: 'pastor@phoenixghanaiansda.org',
      password: pastorPassword,
      role: 'PASTOR',
      status: 'ACTIVE',
      member: {
        create: {
          firstName: 'Emmanuel',
          lastName: 'Asante-Kwatiah',
          phone: '(480) 434-7807',
          ministry: 'Pastoral',
          memberSince: new Date('2018-06-01'),
        }
      }
    }
  })
  console.log('✅ Pastor user created:', pastor.email)

  // ── DEMO MEMBER ──
  const memberPassword = await bcrypt.hash('Member@2026', 10)
  await prisma.user.upsert({
    where: { email: 'kwame.mensah@example.com' },
    update: {},
    create: {
      email: 'kwame.mensah@example.com',
      password: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
      member: {
        create: {
          firstName: 'Kwame',
          lastName: 'Mensah',
          phone: '(480) 555-0142',
          ministry: 'Youth & Children',
          memberSince: new Date('2024-01-15'),
          city: 'Phoenix',
          state: 'AZ',
        }
      }
    }
  })
  console.log('✅ Demo member created')

  // ── CAROUSEL SLIDES ──
  await prisma.carouselSlide.deleteMany()
  await prisma.carouselSlide.createMany({
    data: [
      {
        title: 'Ghana Independence Praise Night',
        description: 'Celebrating Ghanaian heritage with worship, kente attire, traditional food and joyful fellowship. All are welcome — April 19.',
        imageUrl: 'https://assets.adventistconnect.org/phoenixg/2025/10/16124306/carousel2.jpg',
        imageBg: '#1a3010',
        tag: 'gold',
        tagLabel: 'Special Event',
        ctaText: 'View Event Details →',
        ctaUrl: '/events',
        status: 'live',
        order: 1,
      },
      {
        title: 'Practicing Virtues Consistently',
        description: '"Courage is the most important of all virtues, because without courage you can\'t practice any other virtue consistently."',
        imageUrl: 'https://assets.adventistconnect.org/phoenixg/2025/10/16124312/94b15818-640f-4680-8e7a-0c56bbdb742d.jpeg.jpg',
        imageBg: '#1a2e11',
        tag: 'green',
        tagLabel: 'Inspiration',
        ctaText: 'Watch Sermons →',
        ctaUrl: '/sermons',
        status: 'live',
        order: 2,
      },
      {
        title: 'Happiness & Peace Found in God',
        description: '"God cannot give us a happiness and peace apart from Himself, because it is not there." — C.S. Lewis',
        imageUrl: 'https://assets.adventistconnect.org/phoenixg/2025/10/16124320/DSC_0348.jpeg.jpg',
        imageBg: '#1f3a18',
        tag: 'campfire',
        tagLabel: 'Community',
        ctaText: 'Plan Your Visit →',
        ctaUrl: '/contact',
        status: 'live',
        order: 3,
      },
      {
        title: 'Give With a Cheerful Heart',
        description: '"The generous will prosper; those who refresh others will themselves be refreshed." — Proverbs 11:25',
        imageUrl: 'https://assets.adventistconnect.org/phoenixg/2025/10/17090426/ocwyjkfwqp8.jpg',
        imageBg: '#162812',
        tag: 'gold',
        tagLabel: 'Generosity',
        ctaText: 'Give Online →',
        ctaUrl: '/giving',
        status: 'draft',
        order: 4,
      },
    ]
  })
  console.log('✅ Carousel slides seeded')

  // ── EVENTS ──
  await prisma.event.deleteMany()
  await prisma.event.createMany({
    data: [
      { title: 'Community Sabbath Celebration', description: 'A special combined Sabbath service with praise, testimony and an uplifting message. All departments participating — wear your best attire.', category: 'Worship Service', date: new Date('2026-04-05T11:00:00'), location: 'Main Sanctuary', featured: true },
      { title: 'Pathfinders Spring Rally', description: 'Annual Pathfinder rally with activities, drills, honor awards, and an inspiring program.', category: 'Youth Ministry', date: new Date('2026-04-12T09:00:00'), location: 'Fellowship Hall', rsvpRequired: true },
      { title: 'Ghana Independence Praise Night', description: 'Celebrating Ghanaian heritage with worship, kente attire, traditional food and joyful fellowship.', category: 'Cultural Event', date: new Date('2026-04-19T18:00:00'), location: 'Main Sanctuary', dresscode: 'Kente / Cultural wear', rsvpRequired: true, featured: true },
      { title: 'Phoenix Community Health Fair', description: 'Free health screenings, wellness workshops, nutrition demos, and prayer ministry. Open to the entire Phoenix community.', category: 'Community Outreach', date: new Date('2026-05-03T10:00:00'), location: 'Church Parking Lot' },
      { title: "Mother's Day Celebration Service", description: "Special Sabbath service honouring mothers in our church family and community.", category: 'Worship Service', date: new Date('2026-05-17T11:00:00'), location: 'Main Sanctuary' },
    ]
  })
  console.log('✅ Events seeded')

  // ── SERMONS ──
  await prisma.sermon.deleteMany()
  await prisma.sermon.createMany({
    data: [
      { title: 'Walk in the Light of His Word', speaker: 'Pr. Emmanuel Asante-Kwatiah', scriptureRef: 'Psalm 119:105', series: 'Faith Foundations', date: new Date('2026-03-15'), duration: 42, videoUrl: 'https://youtube.com/watch?v=example1', featured: true, description: 'A powerful message on how God\'s Word guides every step of our journey through life, faith, and community.' },
      { title: 'The Promise of His Presence', speaker: 'Pr. Emmanuel Asante-Kwatiah', scriptureRef: 'Joshua 1:9', series: 'Faith Foundations', date: new Date('2026-03-08'), duration: 38, videoUrl: 'https://youtube.com/watch?v=example2', description: 'God\'s promise to never leave nor forsake us — a message of courage and faith.' },
      { title: 'Restored: A Sabbath Blessing', speaker: 'Elder Kofi Boateng', scriptureRef: 'Isaiah 58:13-14', series: 'Ghanaian Heritage Sabbaths', date: new Date('2026-03-01'), duration: 45, videoUrl: 'https://youtube.com/watch?v=example3', description: 'The Sabbath as a gift of restoration and heritage for the Ghanaian Adventist family.' },
      { title: 'Faith That Moves Mountains', speaker: 'Pr. Emmanuel Asante-Kwatiah', scriptureRef: 'Matthew 17:20', series: 'Faith Foundations', date: new Date('2026-02-22'), duration: 36, videoUrl: 'https://youtube.com/watch?v=example4' },
      { title: 'Our Ghanaian Roots in God', speaker: 'Elder Kofi Boateng', scriptureRef: 'Genesis 12:1-3', series: 'Ghanaian Heritage Sabbaths', date: new Date('2026-02-15'), duration: 50, videoUrl: 'https://youtube.com/watch?v=example5' },
      { title: 'The Power of Fasting', speaker: 'Deaconess Abena Mensah', scriptureRef: 'Matthew 6:16-18', series: 'Prayer & Fasting', date: new Date('2026-02-08'), duration: 34, videoUrl: 'https://youtube.com/watch?v=example6' },
      { title: 'Marriage: A Holy Covenant', speaker: 'Pr. Emmanuel Asante-Kwatiah', scriptureRef: 'Ephesians 5:22-33', series: 'Family Life Series', date: new Date('2026-02-01'), duration: 48, status: 'draft' },
    ]
  })
  console.log('✅ Sermons seeded')

  // ── PRAYER REQUESTS ──
  await prisma.prayerRequest.deleteMany()
  await prisma.prayerRequest.createMany({
    data: [
      { name: 'Anonymous', request: 'Please pray for healing for my mother who is currently in the hospital. The doctors say the situation is critical and we are believing God for a miracle.', isPrivate: true, isUrgent: true, status: 'open' },
      { name: 'Kwame M.', request: 'Seeking God\'s guidance for an important job decision. Please pray that I make the right choice for my family.', status: 'new' },
      { name: 'Esi O.', request: 'Please pray for my children who have drifted from the church. I am believing God to draw them back.', status: 'new' },
      { name: 'Anonymous', request: 'Going through financial hardship. Please pray for God\'s provision and open doors.', isPrivate: true, status: 'new' },
      { name: 'Yaa D.', request: 'My medical results came back clear! Praise God for answered prayer. Thank you church family!', status: 'answered' },
    ]
  })
  console.log('✅ Prayer requests seeded')

  // ── GIVING RECORDS ──
  await prisma.givingRecord.deleteMany()
  await prisma.givingRecord.createMany({
    data: [
      { memberName: 'K. Mensah', fund: 'tithe', amount: 250, method: 'online', date: new Date('2026-03-21') },
      { memberName: 'A. Boateng', fund: 'offering', amount: 80, method: 'online', date: new Date('2026-03-21') },
      { memberName: 'E. Owusu', fund: 'building', amount: 100, method: 'sabbath', date: new Date('2026-03-15') },
      { memberName: 'Y. Darko', fund: 'tithe', amount: 320, method: 'online', date: new Date('2026-03-15') },
      { memberName: 'P. Agyemang', fund: 'youth', amount: 50, method: 'sabbath', date: new Date('2026-03-15') },
      { memberName: 'Anonymous', fund: 'offering', amount: 40, method: 'sabbath', date: new Date('2026-03-15') },
      { memberName: 'K. Asante', fund: 'tithe', amount: 200, method: 'online', date: new Date('2026-03-08') },
      { memberName: 'A. Boateng', fund: 'building', amount: 150, method: 'online', date: new Date('2026-03-08') },
    ]
  })
  console.log('✅ Giving records seeded')

  // ── SITE SETTINGS ──
  await prisma.siteSetting.deleteMany()
  const settings = [
    { key: 'church_name', value: 'Phoenix Ghanaian SDA Church', label: 'Church Name', group: 'general' },
    { key: 'church_tagline', value: 'Ghanaian Roots, Adventist Faith, One Family', label: 'Tagline', group: 'general' },
    { key: 'church_address', value: '2802 N 29th St, Phoenix, AZ 85008', label: 'Address', group: 'general' },
    { key: 'church_phone', value: '(480) 434-7807', label: 'Phone', group: 'general' },
    { key: 'church_email', value: 'phoenixghanasda@gmail.com', label: 'Email', group: 'general' },
    { key: 'facebook_url', value: 'https://www.facebook.com/phoenixghanaiansdachurch', label: 'Facebook URL', group: 'social' },
    { key: 'youtube_url', value: 'https://www.youtube.com/channel/UC7iQgLxSD7F6KJFaPWcUeBg', label: 'YouTube URL', group: 'social' },
    { key: 'sabbath_school_time', value: '9:30 AM', label: 'Sabbath School Time', group: 'services' },
    { key: 'worship_time', value: '11:00 AM', label: 'Worship Service Time', group: 'services' },
    { key: 'prayer_meeting_time', value: '7:00 PM Wednesday', label: 'Prayer Meeting', group: 'services' },
    { key: 'carousel_autoplay', value: 'true', type: 'boolean', label: 'Carousel Autoplay', group: 'homepage' },
    { key: 'carousel_interval', value: '5000', type: 'number', label: 'Carousel Interval (ms)', group: 'homepage' },
    { key: 'giving_link', value: 'https://adventistgiving.org/donate/ANP4PG', label: 'Adventist Giving Link', group: 'giving' },
  ]
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: { ...s, type: s.type || 'string' } })
  }
  console.log('✅ Site settings seeded')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📋 LOGIN CREDENTIALS:')
  console.log('   Admin:   admin@phoenixghanaiansda.org  /  Admin@PGSDAchurch2026')
  console.log('   Pastor:  pastor@phoenixghanaiansda.org  /  Pastor@PGSDA2026')
  console.log('   Member:  kwame.mensah@example.com      /  Member@2026')
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
