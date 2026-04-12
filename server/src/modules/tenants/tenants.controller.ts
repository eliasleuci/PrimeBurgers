import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../common/exceptions/AppError';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export class TenantsController {
  
  getAllTenants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // By using prisma and because tenantId logic applies only to other models,
      // we can fetch all Tenants.
      const tenants = await prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json({ status: 'success', data: tenants });
    } catch (error) {
      next(error);
    }
  };

  createTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, slug, adminEmail, adminPassword } = req.body;
      if (!name || !slug || !adminEmail || !adminPassword) {
        throw new AppError('Name, slug, adminEmail, and adminPassword are required', 400);
      }

      const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
      if (existingTenant) {
        throw new AppError('Tenant with this slug already exists', 400);
      }

      const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (existingUser) {
        throw new AppError('Admin email already in use', 400);
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !serviceRoleKey) {
        throw new AppError('Supabase config is missing. Cannot create users.', 500);
      }
      
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // 1. Create user in Supabase Auth
      const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
      });

      if (authError || !userData.user) {
        throw new AppError(`Supabase Auth error: ${authError?.message}`, 400);
      }

      // 2. Create Tenant
      const tenant = await prisma.tenant.create({
        data: {
          name,
          slug,
          isActive: true
        }
      });

      // 3. Create the Local User Profile mapping to Supabase Auth ID
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: {
          id: userData.user.id,
          email: adminEmail,
          password: hashedPassword,
          name: `Admin (${name})`,
          role: 'ADMIN',
          tenantId: tenant.id,
        }
      });
      
      res.status(201).json({ status: 'success', data: tenant });
    } catch (error) {
      next(error);
    }
  };

  toggleTenantStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        throw new AppError('isActive must be a boolean', 400);
      }

      const tenant = await prisma.tenant.update({
        where: { id },
        data: { isActive },
      });

      res.json({ status: 'success', data: tenant });
    } catch (error) {
      next(error);
    }
  };

  resetTenantPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        throw new AppError('New password is required', 400);
      }

      // Check for an ADMIN of this specific tenant
      const user = await prisma.user.findFirst({
        where: { tenantId: id, role: 'ADMIN' },
        orderBy: { email: 'asc' } // Grabs the first one predictably
      });

      if (!user) {
        throw new AppError('No admin user found for this tenant', 404);
      }

      // Hash password for DB validation
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      // Update in Supabase if Service Role Key is available
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && serviceRoleKey) {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        // Update user straight by their known UUID
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          password: newPassword
        });
      } else {
        console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Skipped Supabase Auth password reset.");
      }

      res.json({ status: 'success', message: `Password reset successfully for ${user.email}` });
    } catch (error) {
      next(error);
    }
  };
}
