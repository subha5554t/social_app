// ==========================================
// tests/auth.test.js
// Tests for /api/auth routes using Jest + Supertest
// Run: npm test
// ==========================================

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // see app.js export below

let mongod;

// ---- Setup: start in-memory MongoDB before all tests ----
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// ---- Teardown: close connections after all tests ----
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// ---- Clear DB between tests ----
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ============================================================
// AUTH TESTS
// ============================================================

describe('POST /api/auth/signup', () => {
  const validUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  it('should create a new user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(validUser)
      .expect(201);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('testuser');
    expect(res.body.user).not.toHaveProperty('password'); // never expose password
  });

  it('should return 400 if fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com' }) // missing username and password
      .expect(400);

    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 if email is already taken', async () => {
    // Create user first
    await request(app).post('/api/auth/signup').send(validUser);

    // Try again with same email
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validUser, username: 'different' })
      .expect(400);

    expect(res.body.message).toMatch(/taken/i);
  });

  it('should return 400 if username is already taken', async () => {
    await request(app).post('/api/auth/signup').send(validUser);

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validUser, email: 'other@example.com' })
      .expect(400);

    expect(res.body.message).toMatch(/taken/i);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Seed a user
    await request(app).post('/api/auth/signup').send({
      username: 'loginuser',
      email: 'login@example.com',
      password: 'secret123',
    });
  });

  it('should login and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'secret123' })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('loginuser');
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrongpassword' })
      .expect(401);

    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' })
      .expect(401);

    expect(res.body.message).toMatch(/invalid/i);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: 'meuser',
      email: 'me@example.com',
      password: 'pass1234',
    });
    token = res.body.token;
  });

  it('should return current user when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.user.username).toBe('meuser');
  });

  it('should return 401 without token', async () => {
    await request(app).get('/api/auth/me').expect(401);
  });

  it('should return 401 with invalid token', async () => {
    await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123')
      .expect(401);
  });
});

// ============================================================
// POST TESTS
// ============================================================

describe('POST /api/posts', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: 'postuser',
      email: 'poster@example.com',
      password: 'post1234',
    });
    token = res.body.token;
  });

  it('should create a text post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Hello world! 🌍' })
      .expect(201);

    expect(res.body.post.text).toBe('Hello world! 🌍');
    expect(res.body.post.username).toBe('postuser');
    expect(res.body.post.likes).toHaveLength(0);
    expect(res.body.post.comments).toHaveLength(0);
  });

  it('should return 400 if both text and image are missing', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);

    expect(res.body).toHaveProperty('message');
  });

  it('should return 401 without auth token', async () => {
    await request(app)
      .post('/api/posts')
      .send({ text: 'Unauthorized post' })
      .expect(401);
  });
});

describe('GET /api/posts', () => {
  it('should return paginated posts without authentication', async () => {
    const res = await request(app)
      .get('/api/posts?page=1&limit=10')
      .expect(200);

    expect(res.body).toHaveProperty('posts');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.posts)).toBe(true);
  });
});

describe('PUT /api/posts/:id/like', () => {
  let token, postId;

  beforeEach(async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      username: 'liker', email: 'liker@example.com', password: 'like1234',
    });
    token = signupRes.body.token;

    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Like me!' });
    postId = postRes.body.post._id;
  });

  it('should like a post', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.liked).toBe(true);
    expect(res.body.likesCount).toBe(1);
  });

  it('should unlike a post (toggle)', async () => {
    // Like first
    await request(app)
      .put(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);

    // Unlike
    const res = await request(app)
      .put(`/api/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.liked).toBe(false);
    expect(res.body.likesCount).toBe(0);
  });
});

describe('POST /api/posts/:id/comment', () => {
  let token, postId;

  beforeEach(async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      username: 'commenter', email: 'cmnt@example.com', password: 'cmnt1234',
    });
    token = signupRes.body.token;

    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Comment on me!' });
    postId = postRes.body.post._id;
  });

  it('should add a comment to a post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comment`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Great post! 🎉' })
      .expect(201);

    expect(res.body.comment.text).toBe('Great post! 🎉');
    expect(res.body.comment.username).toBe('commenter');
    expect(res.body.commentsCount).toBe(1);
  });

  it('should return 400 for empty comment', async () => {
    await request(app)
      .post(`/api/posts/${postId}/comment`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: '   ' })
      .expect(400);
  });
});

describe('DELETE /api/posts/:id', () => {
  let token, postId;

  beforeEach(async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      username: 'deleter', email: 'del@example.com', password: 'del12345',
    });
    token = signupRes.body.token;

    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Delete me!' });
    postId = postRes.body.post._id;
  });

  it('should delete own post', async () => {
    await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('should not delete another user\'s post', async () => {
    // Create another user
    const other = await request(app).post('/api/auth/signup').send({
      username: 'other', email: 'other@example.com', password: 'other1234',
    });

    await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${other.body.token}`)
      .expect(403);
  });
});
