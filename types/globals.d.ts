export {};

declare module "*.css";

declare global {
  namespace Clerk {
    interface CustomJwtSessionClaims {
      email?: string;
      fullName?: string;
      image?: string;
    }
  }
}
