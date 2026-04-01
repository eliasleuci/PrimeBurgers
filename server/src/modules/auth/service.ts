import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './repository';
import { AppError } from '../../common/exceptions/AppError';

const authRepository = new AuthRepository();

export class AuthService {
  async login(email: string, pass: string) {
    const user = await authRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: user.branchId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    return { token, user: { id: user.id, name: user.name, role: user.role, branch: user.branch } };
  }
}
