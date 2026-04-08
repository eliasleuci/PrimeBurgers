import { basePrisma } from '../../config/database';

export class AuthRepository {
  async findByEmail(email: string) {
    try {
      console.log('--- Iniciando búsqueda ---');
      const user = await basePrisma.user.findFirst({
        where: { 
          email: email.toLowerCase().trim()
        },
        include: {
          tenant: true
        }
      });
      
      console.log('Resultado:', user ? `Usuario ${user.email} encontrado` : 'No encontrado');
      return user;
    } catch (error: any) {
      console.error('--- ERROR CRÍTICO EN REPOSITORY ---');
      console.error('Código:', error.code);
      console.error('Mensaje:', error.message);
      throw error;
    }
  }
}