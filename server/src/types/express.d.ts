import { JwtPayload } from '../modules/auth/service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        tenantId: string;
        branchId?: string | null;
      };
    }
  }
}