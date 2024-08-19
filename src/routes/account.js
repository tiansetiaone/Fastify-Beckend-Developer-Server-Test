const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function accountRoutes(fastify, options) {
  // GET /accounts - Ambil semua akun pengguna
  fastify.get('/accounts', async (request, reply) => {
    try {
      const userId = request.user.id; // Ambil ID pengguna dari token/otentikasi
      const accounts = await prisma.account.findMany({
        where: { userId },
        include: {
          history: true, // Sertakan riwayat pembayaran
        },
      });
      reply.send(accounts);
    } catch (err) {
      reply.status(500).send({ error: 'Terjadi kesalahan saat mengambil akun' });
    }
  });

  // GET /transactions - Ambil semua transaksi per akun pengguna
  fastify.get('/transactions', async (request, reply) => {
    try {
      const userId = request.user.id; // Ambil ID pengguna dari token/otentikasi
      const accounts = await prisma.account.findMany({
        where: { userId },
        include: {
          history: true,
        },
      });

      const transactions = accounts.flatMap(account => account.history);
      reply.send(transactions);
    } catch (err) {
      reply.status(500).send({ error: 'Terjadi kesalahan saat mengambil transaksi' });
    }
  });
}

module.exports = accountRoutes;
