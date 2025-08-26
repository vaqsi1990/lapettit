import { PrismaClient, CakeCategory } from '@prisma/client'

const prisma = new PrismaClient()

const cakes = [
  // Birthday Cakes
  {
    name: "Chocolate Birthday Delight",
    description: "Rich chocolate cake with colorful sprinkles and birthday candles",
    price: 45.99,
    imageUrl: "/catalog/1.jpg",
    category: CakeCategory.BIRTHDAY
  },
  {
    name: "Vanilla Rainbow Cake",
    description: "Light vanilla layers with rainbow frosting and edible glitter",
    price: 52.99,
    imageUrl: "/catalog/2.jpg",
    category: CakeCategory.BIRTHDAY
  },
  {
    name: "Strawberry Celebration",
    description: "Fresh strawberry cake with cream cheese frosting and fresh berries",
    price: 48.99,
    imageUrl: "/catalog/3.jpg",
    category: CakeCategory.BIRTHDAY
  },
  
  // Wedding Cakes
  {
    name: "Elegant White Wedding",
    description: "Classic white wedding cake with delicate floral decorations",
    price: 299.99,
    imageUrl: "/hero/1.png",
    category: CakeCategory.WEDDING
  },
  {
    name: "Royal Wedding Deluxe",
    description: "Multi-tier wedding cake with gold accents and fresh flowers",
    price: 399.99,
    imageUrl: "/hero/2.png",
    category: CakeCategory.WEDDING
  },
  {
    name: "Modern Naked Cake",
    description: "Contemporary naked cake with fresh fruit and minimal decoration",
    price: 249.99,
    imageUrl: "/hero/3.png",
    category: CakeCategory.WEDDING
  },
  
  // Anniversary Cakes
  {
    name: "Golden Anniversary",
    description: "Elegant cake with gold leaf and romantic decorations",
    price: 89.99,
    imageUrl: "/hero/22ef396d-3842-44a0-be8d-6f1ab7b1aec2.png",
    category: CakeCategory.ANNIVERSARY
  },
  {
    name: "Silver Celebration",
    description: "Silver-themed cake perfect for 25th anniversary",
    price: 79.99,
    imageUrl: "/hero/528840499_1341682604631620_4000600754266452299_n.jpg",
    category: CakeCategory.ANNIVERSARY
  },
  
  // Custom Cakes
  {
    name: "Personalized Message Cake",
    description: "Custom cake with your personal message and design",
    price: 65.99,
    imageUrl: "/hero/530248860_1343671131099434_2511349373577876023_n.jpg",
    category: CakeCategory.CUSTOM
  },
  {
    name: "Photo Cake",
    description: "Cake with edible photo print and custom decorations",
    price: 75.99,
    imageUrl: "/hero/534472152_1350659393733941_4241408366837870335_n.jpg",
    category: CakeCategory.CUSTOM
  },
  
  // Desserts
  {
    name: "Tiramisu Slice",
    description: "Classic Italian tiramisu with coffee and mascarpone",
    price: 8.99,
    imageUrl: "/catalog/1.jpg",
    category: CakeCategory.Desserts
  },
  {
    name: "Cheesecake Delight",
    description: "Creamy New York style cheesecake with berry compote",
    price: 12.99,
    imageUrl: "/catalog/2.jpg",
    category: CakeCategory.Desserts
  },
  {
    name: "Chocolate Mousse",
    description: "Rich chocolate mousse with chocolate shavings",
    price: 9.99,
    imageUrl: "/catalog/3.jpg",
    category: CakeCategory.Desserts
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
