import { prisma } from '../../config/database';

export class ReportService {
  async getDailySales(branchId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await prisma.order.findMany({
      where: {
        branchId,
        createdAt: { gte: today },
        status: { not: 'CANCELLED' }
      },
      select: {
        total: true,
        createdAt: true
      }
    });

    const totalSales = sales.reduce((acc: number, sale: any) => acc + Number(sale.total), 0);

    return {
      date: today,
      count: sales.length,
      total: totalSales
    };
  }
}
