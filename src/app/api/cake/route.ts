import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CakeCategory = {
  BIRTHDAY: 'BIRTHDAY',
  WEDDING: 'WEDDING',
  ANNIVERSARY: 'ANNIVERSARY',
  CUSTOM: 'CUSTOM',
  Desserts: 'Desserts'
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      description,
      price,
      category,
      servings,
      weightKg,
      flavors,
      fillings,
      isCustomizable,
      available,
      imageUrl,
   
    } = body;

    // Validate required fields
    if (!name || !description || !price || !category || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'ყველა სავალდებულო ველი უნდა იყოს შევსებული' },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(CakeCategory).includes(category)) {
      return NextResponse.json(
        { success: false, error: 'არასწორი კატეგორია' },
        { status: 400 }
      );
    }

    // Create the cake
    const cake = await prisma.cake.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        servings: servings ? parseInt(servings) : null,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        flavors: flavors || [],
        fillings: fillings || [],
        isCustomizable: isCustomizable !== undefined ? isCustomizable : true,
        available: available !== undefined ? available : true,
        imageUrl: imageUrl,
    
      }
    });

    return NextResponse.json({
      success: true,
      data: cake,
      message: 'ტორტი წარმატებით შეიქმნა'
    });

  } catch (error) {
    console.error('Error creating cake:', error);
    return NextResponse.json(
      { success: false, error: 'ტორტის შექმნისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
