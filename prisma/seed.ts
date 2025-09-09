import { PrismaClient } from '@prisma/client'
const CakeCategory = {
  BIRTHDAY: 'BIRTHDAY',
  WEDDING: 'WEDDING',
  ANNIVERSARY: 'ANNIVERSARY',
  CUSTOM: 'CUSTOM',
  Desserts: 'Desserts'
} as const;

const prisma = new PrismaClient()

const cakes = [

  {
    name: "პირველი კბილი",
    imageUrl: "/cakes/1.jpeg",
    category: CakeCategory.CUSTOM,
    pieces: 8,
    hasMarzipan: true,
    marzipanPrice: 100.0,
    isCustomizable: true,
    available: true
  },
  {
    name: "დათუნია",
    imageUrl: "/cakes/2.jpeg",
    category: CakeCategory.BIRTHDAY,
    pieces: 8,
    hasMarzipan: true,
    marzipanPrice: 100.0,
    creamPrice: 90.0,
    hasCream: true,
    isCustomizable: true,
    available: true
  },
  {
    name: "გამოშვება",
    imageUrl: "/cakes/3.jpeg",
    category: CakeCategory.WEDDING,
    hasMarzipan: false,
    isCustomizable: true,
    available: true,
    pieces: 8,
    hasCream: true,
    creamPrice: 75.0,
  },

  // Wedding Cakes
  {
    name: "ღუზა",
    imageUrl: "/cakes/4.jpeg",
    category: CakeCategory.ANNIVERSARY,
    hasMarzipan: true,
    marzipanPrice: 100.0,
    isCustomizable: true,
    available: true,
    pieces: 8,
  },
  {
    name: "ბარბი",
    imageUrl: "/cakes/5.jpeg",
    category: CakeCategory.CUSTOM,
    hasMarzipan: true,
    marzipanPrice: 100.0,
    hasCream:false,
    isCustomizable: true,
    available: true,
    pieces: 8,
  },
  {
    name: "თქვენი პატარებისთვის ",
    imageUrl: "/cakes/6.jpeg",
    category: CakeCategory.BIRTHDAY,
    hasMarzipan: false,
    hasCream: true,
    creamPrice:  65.0,
    isCustomizable: true,
    available: true,
    pieces: 8
  },

  // Anniversary Cakes
  {
    name: "გოგონა ბუშტებით",
    imageUrl: "/cakes/7.jpeg",
    category: CakeCategory.Desserts,
    pieces: 18,
    isCustomizable: true,
    available: true
  },
  {
    name: "გოგონა შავ კაბაში",
    imageUrl: "/cakes/8.jpeg",
    category: CakeCategory.BIRTHDAY,
    pieces: 8,
    hasCream: false,
    hasMarzipan: true,
    marzipanPrice: 100.0,
    isCustomizable: true,
    available: true
  },

  // Custom Cakes
  {
    name: "ცხოველები",

    imageUrl: "/cakes/9.jpeg",
    category: CakeCategory.CUSTOM,
    pieces: 8,
    hasCream: false,
    hasMarzipan: true,
    marzipanPrice: 180.0,
    isCustomizable: true,
    available: true
  },
  {
    name: "ფერია",

    imageUrl: "/cakes/10.jpeg",
    category: CakeCategory.CUSTOM,
    pieces: 8,
    hasCream: false,
    hasMarzipan: true,
    marzipanPrice: 120.0,
    isCustomizable: true,
    available: true
  },

  // Desserts
  {
    name: "ტორტი კბილის ფიგურით",

    imageUrl: "/cakes/11.jpeg",
    category: CakeCategory.Desserts,
    pieces: 8,
    hasCream: true,
    creamPrice: 75.0,
    hasMarzipan: true,
    marzipanPrice: 90.0,
    isCustomizable: true,
    available: true
  },
  {
    name: "Cheesecake Delight",

    imageUrl: "/cakes/12.jpeg",
    category: CakeCategory.Desserts,

    isCustomizable: false,
    available: true
  },
  {
    name: "Choco=late Mousse",

    imageUrl: "/cakes/13.jpeg",
    category: CakeCategory.Desserts,

    isCustomizable: false,
    available: true
  }
]

async function main() {
  console.log('Start seeding...')

  // Clear existing cakes
  await prisma.cake.deleteMany()
  console.log('Cleared existing cakes')

  // Create new cakes
  for (const cake of cakes) {
    const createdCake = await prisma.cake.create({
      data: cake
    })
    console.log(`Created cake: ${createdCake.name}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
