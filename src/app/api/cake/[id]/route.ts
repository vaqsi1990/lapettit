import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


const CakeCategoryEnum = {
  BIRTHDAY: 'BIRTHDAY',
  WEDDING: 'WEDDING',
  ANNIVERSARY: 'ANNIVERSARY',
  CUSTOM: 'CUSTOM',
  Desserts: 'Desserts'
} as const;

const ProductType = {
  FULL_CAKE: 'FULL_CAKE',
  SET: 'SET',
  INDIVIDUAL_SLICE: 'INDIVIDUAL_SLICE'
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
      category,
      productType,
      price,
      fillings,
      isCustomizable,
      available,
      imageUrl,
      pieces,
      hasMarzipan,
      marzipanPrice,
      hasCream,
      creamPrice,
      setItems,
      setDescription,
      sliceWeight,
      sliceDescription,
    } = body;

    // Validate required fields
    if (!name || !category || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'ყველა სავალდებულო ველი უნდა იყოს შევსებული' },
        { status: 400 }
      );
    }

    // Validate price for non-customizable cakes
    if (!isCustomizable && (!price || price <= 0)) {
      return NextResponse.json(
        { success: false, error: 'სტანდარტული ტორტისთვის ფასი სავალდებულოა' },
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

    // Validate product type
    if (productType && !Object.values(ProductType).includes(productType)) {
      return NextResponse.json(
        { success: false, error: 'არასწორი პროდუქტის ტიპი' },
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
        category,
        productType: (productType || 'FULL_CAKE') as any,
        price: isCustomizable ? null : (price ? Math.round(price * 100) / 100 : null),
        fillings: fillings || [],
        isCustomizable: isCustomizable !== undefined ? isCustomizable : false,
        available: available !== undefined ? available : true,
        imageUrl: imageUrl,
        pieces: pieces ? parseInt(pieces) : null,
        hasMarzipan: hasMarzipan || false,
        marzipanPrice: hasMarzipan && marzipanPrice ? Math.round(parseFloat(marzipanPrice) * 100) / 100 : null,
        hasCream: hasCream || false,
        creamPrice: hasCream && creamPrice ? Math.round(parseFloat(creamPrice) * 100) / 100 : null,
        setItems: setItems || [],
        setDescription: setDescription || null,
        sliceWeight: sliceWeight || null,
        sliceDescription: sliceDescription || null,
      } as any
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
