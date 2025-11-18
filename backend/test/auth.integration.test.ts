import request from 'supertest';

describe('Auth integration', () => {
  const api = request('http://127.0.0.1:4000');

  it('register -> 201 or 409 (duplicate)', async () => {
    const res = await api.post('/api/auth/register').send({
      email: 'itest+' + Date.now() + '@example.com',
      password: 'Test12345'
    });
    expect([201, 409]).toContain(res.status);
  });

  it('login -> 200 with accessToken', async () => {
    const email = 'itest-login+' + Date.now() + '@example.com';
    const password = 'Test12345';
    // Create the user (if 409 ignore)
    await api.post('/api/auth/register').send({ email, password });
    const res = await api.post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  }, 20000);
});
