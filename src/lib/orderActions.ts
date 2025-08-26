"use client";

export interface OrderFormData {
  cakeId: number;
  quantity: number;
  customerName: string;
  lastName?: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  city?: string;
  zipCode?: string;
  notes?: string;
  totalPrice?: number;
}

export async function submitOrder(formData: OrderFormData) {
  try {
    const response = await fetch('/api/order', {
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
    console.error('Error submitting order:', error);
    throw error;
  }
}
