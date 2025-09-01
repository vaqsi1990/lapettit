import { PrismaClient} from '@prisma/client'
const CakeCategory = {
  BIRTHDAY: 'BIRTHDAY',
  WEDDING: 'WEDDING',
  ANNIVERSARY: 'ANNIVERSARY',
  CUSTOM: 'CUSTOM',
  Desserts: 'Desserts'
} as const;

const prisma = new PrismaClient()

const cakes = [
  // Birthday Cakes
  {
    name: "Chocolate Birthday Delight",
    description: "Rich chocolate cake with colorful sprinkles and birthday candles",
    price: 45.99,
    imageUrl: "/catalog/1.jpg",
    gallery: ["/catalog/1.jpg", "/catalog/2.jpg"],
    category: CakeCategory.BIRTHDAY,
    servings: 8,
    weightKg: 1.5,
    flavors: ["შოკოლადი", "ვანილი"],
    fillings: ["კრემი", "ჯემი", "შოკოლადი"],
    isCustomizable: true,
    available: true
  },
  {
    name: "Vanilla Rainbow Cake",
    description: "Light vanilla layers with rainbow frosting and edible glitter",
    price: 52.99,
    imageUrl: "/catalog/2.jpg",
    gallery: ["/catalog/2.jpg", "/catalog/3.jpg"],
    category: CakeCategory.BIRTHDAY,
    servings: 10,
    weightKg: 1.8,
    flavors: ["ვანილი", "შოკოლადი"],
    fillings: ["კრემი", "ჯემი"],
    isCustomizable: true,
    available: true
  },
  {
    name: "Strawberry Celebration",
    description: "Fresh strawberry cake with cream cheese frosting and fresh berries",
    price: 48.99,
    imageUrl: "/catalog/3.jpg",
    gallery: ["/catalog/3.jpg", "/catalog/1.jpg"],
    category: CakeCategory.WEDDING,
    servings: 8,
    weightKg: 1.6,
    flavors: ["მარწყვი", "ვანილი"],
    fillings: ["კრემი", "ჯემი"],
    isCustomizable: true,
    available: true
  },
  
  // Wedding Cakes
  {
    name: "Elegant White Wedding",
    description: "Classic white wedding cake with delicate floral decorations",
    price: 299.99,
    imageUrl: "/hero/1.png",
    gallery: ["/hero/1.png", "/hero/2.png"],
    category: CakeCategory.ANNIVERSARY,
    servings: 50,
    weightKg: 8.0,
    flavors: ["ვანილი", "შოკოლადი", "მარწყვი"],
    fillings: ["კრემი", "ჯემი"],
    isCustomizable: true,
    available: true
  },
  {
    name: "Royal Wedding Deluxe",
    description: "Multi-tier wedding cake with gold accents and fresh flowers",
    price: 399.99,
    imageUrl: "/hero/2.png",
    gallery: ["/hero/2.png", "/hero/3.png"],
    category: CakeCategory.CUSTOM,
    servings: 80,
    weightKg: 12.0,
    flavors: ["შოკოლადი", "ვანილი", "წითელი ხავერდი"],
    fillings: ["კრემი", "ჯემი", "შოკოლადი"],
    isCustomizable: true,
    available: true
  },
  {
    name: "Modern Naked Cake",
    description: "Contemporary naked cake with fresh fruit and minimal decoration",
    price: 249.99,
    imageUrl: "/hero/3.png",
    gallery: ["/hero/3.png", "/hero/1.png"],
    category: CakeCategory.CUSTOM,
    servings: 40,
    weightKg: 6.0,
    flavors: ["ვანილი", "მარწყვი"],
    fillings: ["კრემი", "ჯემი"],
    isCustomizable: true,
    available: true
  },
  
  // Anniversary Cakes
  {
    name: "Golden Anniversary",
    description: "Elegant cake with gold leaf and romantic decorations",
    price: 89.99,
    imageUrl: "/hero/22ef396d-3842-44a0-be8d-6f1ab7b1aec2.png",
    gallery: ["/hero/22ef396d-3842-44a0-be8d-6f1ab7b1aec2.png", "/hero/528840499_1341682604631620_4000600754266452299_n.jpg"],
    category: CakeCategory.Desserts,
    servings: 12,
    weightKg: 2.5,
    flavors: ["შოკოლადი", "ვანილი"],
    fillings: ["კრემი", "ჯემი", "შოკოლადი"],
    isCustomizable: true,
    available: true
  },
  {
    name: "Silver Celebration",
    description: "Silver-themed cake perfect for 25th anniversary",
    price: 79.99,
    imageUrl: "/hero/528840499_1341682604631620_4000600754266452299_n.jpg",
    gallery: ["/hero/528840499_1341682604631620_4000600754266452299_n.jpg", "/hero/530248860_1343671131099434_2511349373577876023_n.jpg"],
    category: CakeCategory.Desserts,
    servings: 10,
    weightKg: 2.0,
    flavors: ["ვანილი", "შოკოლადი"],
    fillings: ["კრემი", "ჯემი"],
    isCustomizable: true,
    available: true
  },
  
  // Custom Cakes
  {
    name: "Personalized Message Cake",
    description: "Custom cake with your personal message and design",
    price: 65.99,
    imageUrl: "/hero/530248860_1343671131099434_2511349373577876023_n.jpg",
    gallery: ["/hero/530248860_1343671131099434_2511349373577876023_n.jpg", "/hero/534472152_1350659393733941_4241408366837870335_n.jpg"],
    category: CakeCategory.CUSTOM,
    servings: 8,
    weightKg: 1.8,
    flavors: ["შოკოლადი", "ვანილი", "მარწყვი"],
    fillings: ["კრემი", "ჯემი", "შოკოლადი"],
    isCustomizable: true,
    available: true
  },
  {
    name: "Photo Cake",
    description: "Cake with edible photo print and custom decorations",
    price: 75.99,
    imageUrl: "/hero/534472152_1350659393733941_4241408366837870335_n.jpg",
    gallery: ["/hero/534472152_1350659393733941_4241408366837870335_n.jpg", "/hero/1.png"],
    category: CakeCategory.CUSTOM,
    servings: 10,
    weightKg: 2.2,
    flavors: ["ვანილი", "შოკოლადი"],
    fillings: ["კრემი", "ჯემი"],
    isCustomizable: true,
    available: true
  },
  
  // Desserts
  {
    name: "Tiramisu Slice",
    description: "Classic Italian tiramisu with coffee and mascarpone",
    price: 8.99,
    imageUrl: "/catalog/1.jpg",

    category: CakeCategory.Desserts,
    servings: 1,
    weightKg: 0.2,
    flavors: ["ყავა", "ვანილი"],
    fillings: ["კრემი", "ჯემი"],
    isCustomizable: false,
    available: true
  },
  {
    name: "Cheesecake Delight",
    description: "Creamy New York style cheesecake with berry compote",
    price: 12.99,
    imageUrl: "/catalog/2.jpg",

    category: CakeCategory.Desserts,
    servings: 1,
    weightKg: 0.3,
    flavors: ["ვანილი", "მარწყვი"],
    fillings: ["კრემი", "ჯემი"],
    isCustomizable: false,
    available: true
  },
  {
    name: "Chocolate Mousse",
    description: "Rich chocolate mousse with chocolate shavings",
    price: 9.99,
    imageUrl: "/catalog/3.jpg",

    category: CakeCategory.Desserts,
    servings: 1,
    weightKg: 0.25,
    flavors: ["შოკოლადი"],
    fillings: ["შოკოლადი", "კრემი"],
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
