const fastify = require('fastify')();
({ logger: true });
require('dotenv').config();
const jwt = require('fastify-jwt');

fastify.register(jwt, {
  secret: 'mysecret',
});

fastify.post('/login', async (request, reply) => {
  const { email, password } = request.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return reply.status(401).send('Invalid email or password');
  }
  const token = fastify.jwt.sign({ id: user.id });
  reply.send({ token });
});


// Daftarkan rute akun
const accountRoutes = require('./routes/account');

fastify.register(accountRoutes);

// Daftarkan rute layanan pembayaran
const paymentRoutes = require('./routes/payment');
fastify.register(paymentRoutes);

const start = async () => {
  try {
    await fastify.listen(3000, '0.0.0.0');
    fastify.log.info(`Server berjalan pada ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();


