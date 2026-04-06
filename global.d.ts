// TypeScript global type declarations for the application

declare global {
  interface CustomJwtSessionClaims {
    id?: string;
    isPremium?: boolean;
    premiumExpiry?: Date;
  }
}

export {};
