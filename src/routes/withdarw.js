fastify.post('/withdraw', async (request, reply) => {
    const { amount, accountId } = request.body;
    const transaction = await prisma.transaction.create({
      data: { amount, accountId, status: 'pending' }
    });
  
    processTransaction(transaction).then(updatedTransaction => {
      prisma.transaction.update({
        where: { id: updatedTransaction.id },
        data: { status: 'completed' }
      });
      reply.send(updatedTransaction);
    });
  });
  