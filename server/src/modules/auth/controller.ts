import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';

const authService = new AuthService();

export class AuthController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: 'fail',
          message: 'Por favor, proporcione email y contraseña'
        });
      }

      const data = await authService.login(email, password);

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  exchangeToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supabaseToken } = req.body;
      
      if (!supabaseToken) {
        return res.status(400).json({
          status: 'fail',
          message: 'supabaseToken is required'
        });
      }

      const data = await authService.exchangeToken(supabaseToken);

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };
}