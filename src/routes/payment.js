const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fungsi untuk memproses transaksi
async function processTransaction(transaction) {
  return new Promise((resolve, reject) => {
    console.log('Transaction processing started for:', transaction);

    // Simulasi proses yang lama
    setTimeout(() => {
      console.log('Transaction processed for:', transaction);
      resolve(transaction);
    }, 30000); // 30 detik
  });
}

async function paymentRoutes(fastify, options) {
  // POST /send - Kirim uang
  fastify.post('/send', async (request, reply) => {
    const { userId, accountId, amount, toAddress } = request.body;

    try {
      // Validasi akun dan saldo
      const account = await prisma.account.findUnique({ where: { id: accountId } });
      if (!account || account.userId !== userId) {
        return reply.status(400).send({ error: 'Akun tidak valid' });
      }

      if (account.balance < amount) {
        return reply.status(400).send({ error: 'Saldo tidak mencukupi' });
      }

      // Buat transaksi
      const transaction = await prisma.transaction.create({
        data: {
          amount,
          currency: 'USD',
          toAddress,
          status: 'pending',
        },
      });

      // Proses transaksi
      const processedTransaction = await processTransaction(transaction);

      // Setelah sukses, perbarui saldo akun dan riwayat pembayaran
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: amount,
          },
          history: {
            create: {
              amount: -amount,
              timestamp: new Date(),
            },
          },
        },
      });

      // Perbarui status transaksi menjadi sukses
      await prisma.transaction.update({
        where: { id: processedTransaction.id },
        data: { status: 'success' },
      });

      reply.send({ success: true, transaction: processedTransaction });
    } catch (err) {
      reply.status(500).send({ error: 'Terjadi kesalahan saat memproses transaksi' });
    }
  });

  // POST /withdraw - Tarik uang
  fastify.post('/withdraw', async (request, reply) => {
    const { userId, accountId, amount } = request.body;

    try {
      // Validasi akun dan saldo
      const account = await prisma.account.findUnique({ where: { id: accountId } });
      if (!account || account.userId !== userId) {
        return reply.status(400).send({ error: 'Akun tidak valid' });
      }

      if (account.balance < amount) {
        return reply.status(400).send({ error: 'Saldo tidak mencukupi' });
      }

      // Buat transaksi
      const transaction = await prisma.transaction.create({
        data: {
          amount,
          currency: 'USD',
          toAddress: 'WITHDRAWAL',
          status: 'pending',
        },
      });

      // Proses transaksi
      const processedTransaction = await processTransaction(transaction);

      // Setelah sukses, perbarui saldo akun dan riwayat pembayaran
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: amount,
          },
          history: {
            create: {
              amount: -amount,
              timestamp: new Date(),
            },
          },
        },
      });

      // Perbarui status transaksi menjadi sukses
      await prisma.transaction.update({
        where: { id: processedTransaction.id },
        data: { status: 'success' },
      });

      reply.send({ success: true, transaction: processedTransaction });
    } catch (err) {
      reply.status(500).send({ error: 'Terjadi kesalahan saat memproses penarikan' });
    }
  });
}

module.exports = paymentRoutes;
