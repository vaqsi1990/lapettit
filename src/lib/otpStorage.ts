// Shared OTP storage for both send-otp and verify-otp routes
// In production, use Redis or database instead of in-memory storage

interface OTPData {
  otp: string;
  timestamp: number;
}

class OTPStorage {
  private storage = new Map<string, OTPData>();

  set(email: string, otp: string): void {
    console.log(`Setting OTP for ${email}: ${otp}`);
    
    // Clear any existing OTP for this email first
    this.storage.delete(email);
    
    // Set new OTP
    this.storage.set(email, {
      otp,
      timestamp: Date.now()
    });
    
    console.log(`Current storage size: ${this.storage.size}`);
    console.log(`All stored emails: ${Array.from(this.storage.keys())}`);
    
    // Verify it was stored correctly
    const stored = this.storage.get(email);
    console.log(`Verification - Stored OTP for ${email}:`, stored);
  }

  get(email: string): OTPData | undefined {
    const data = this.storage.get(email);
    console.log(`Getting OTP for ${email}:`, data);
    return data;
  }

  delete(email: string): boolean {
    console.log(`Deleting OTP for ${email}`);
    const result = this.storage.delete(email);
    console.log(`Delete result: ${result}, Current storage size: ${this.storage.size}`);
    return result;
  }

  // Method to check if OTP exists without removing it
  exists(email: string): boolean {
    return this.storage.has(email);
  }

  cleanup(): void {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    
    for (const [email, data] of this.storage.entries()) {
      if (now - data.timestamp > tenMinutes) {
        this.storage.delete(email);
      }
    }
  }
}

// Export singleton instance
export const otpStorage = new OTPStorage();

// Clean up expired OTPs every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    otpStorage.cleanup();
  }, 5 * 60 * 1000);
}
