const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Auth API', () => {
  const testUser = {
    nome: 'Test User',
    email: 'test@example.com',
    senha: 'password123',
    tipo: 'morador',
    cep: '01001000'
  };

  afterEach(async () => {
    // Limpar usuário de teste após cada teste
  });

  test('POST /api/auth/register - deve criar um novo usuário', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body.message).toBe('Usuário criado com sucesso');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /api/auth/login - deve fazer login com credenciais válidas', async () => {
    // Primeiro registrar o usuário
    await request(app).post('/api/auth/register').send(testUser);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        senha: testUser.senha
      })
      .expect(200);

    expect(response.body.message).toBe('Login realizado com sucesso');
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /api/auth/login - não deve fazer login com credenciais inválidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        senha: 'wrongpassword'
      })
      .expect(401);

    expect(response.body.error).toBe('Credenciais inválidas');
  });
});