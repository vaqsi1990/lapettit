"use client";

export interface CustomCakeFormData {
  design: string;
  flavor: string;
  filling?: string;
  glaze?: string;
  shape?: string;
  decorations: string[];
  text?: string;
  quantity: number;
  deliveryDate: string;
  deliveryTime?: string;
  imageUrl?: string;
  customerName: string;
  lastName?: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  city?: string;
  zipCode?: string;
  notes?: string;
  totalPrice: number;
}

export async function submitCustomCakeOrder(formData: CustomCakeFormData) {
  try {
    const response = await fetch('/api/custom-cake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit order');
    }

    return result;
  } catch (error) {
    console.error('Error submitting custom cake order:', error);
    throw error;
  }
}
