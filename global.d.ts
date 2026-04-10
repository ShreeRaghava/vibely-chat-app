// TypeScript global type declarations for the application

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI?: string;
      NEXTAUTH_URL?: string;
      NEXTAUTH_SECRET?: string;
    }

    interface Process {
      env: ProcessEnv;
    }
  }

  interface CustomJwtSessionClaims {
    id?: string;
  }
}

export {};
