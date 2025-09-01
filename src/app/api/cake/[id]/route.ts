import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


const CakeCategoryEnum = {
  BIRTHDAY: 'BIRTHDAY',
  WEDDING: 'WEDDING',
  ANNIVERSARY: 'ANNIVERSARY',
  CUSTOM: 'CUSTOM',
  Desserts: 'Desserts'
} as const;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cakeId = parseInt(id);
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
      gallery
    } = body;

    // Validate required fields
    if (!name || !description || !price || !category || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'ყველა სავალდებულო ველი უნდა იყოს შევსებული' },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(CakeCategoryEnum).includes(category)) {
      return NextResponse.json(
        { success: false, error: 'არასწორი კატეგორია' },
        { status: 400 }
      );
    }

    // Check if cake exists
    const existingCake = await prisma.cake.findUnique({
      where: { id: cakeId }
    });

    if (!existingCake) {
      return NextResponse.json(
        { success: false, error: 'ტორტი ვერ მოიძებნა' },
        { status: 404 }
      );
    }

    // Update the cake
    const updatedCake = await prisma.cake.update({
      where: { id: cakeId },
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
        gallery: gallery || []
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCake,
      message: 'ტორტი წარმატებით განახლდა'
    });

  } catch (error) {
    console.error('Error updating cake:', error);
    return NextResponse.json(
      { success: false, error: 'ტორტის განახლებისას მოხდა შეცდომა' },
      { status: 500 }
    );
  }
}
