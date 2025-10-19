import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { AppModule } from '../src/app.module'

describe('User API (e2e)', () => {
  let app: INestApplication
  let createdUserId: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('/users (POST)', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'John Doe', email: 'john@example.com' })
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('id')
          expect(response.body.name).toBe('John Doe')
          expect(response.body.email).toBe('john@example.com')
          expect(response.body).toHaveProperty('createdAt')
          expect(response.body).toHaveProperty('updatedAt')
          expect(response.body).toHaveProperty('accountAge')
          createdUserId = response.body.id
        })
    })

    it('should return 409 when creating user with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Jane Doe', email: 'john@example.com' })
        .expect(409)
    })

    it('should return 500 when creating user with invalid email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Invalid User', email: 'invalid-email' })
        .expect(500)
    })

    it('should return 500 when creating user with empty name', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: '', email: 'empty@example.com' })
        .expect(500)
    })

    it('should return 500 when creating user with name too short', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'J', email: 'short@example.com' })
        .expect(500)
    })
  })

  describe('/users/:id (GET)', () => {
    it('should get a user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200)
        .then(response => {
          expect(response.body.id).toBe(createdUserId)
          expect(response.body.name).toBe('John Doe')
          expect(response.body.email).toBe('john@example.com')
        })
    })

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer()).get('/users/non-existent-id').expect(404)
    })
  })

  describe('/users (GET)', () => {
    it('should list all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBe(true)
          expect(response.body.length).toBeGreaterThan(0)
          expect(response.body[0]).toHaveProperty('id')
          expect(response.body[0]).toHaveProperty('name')
          expect(response.body[0]).toHaveProperty('email')
        })
    })
  })

  describe('/users/:id (PUT)', () => {
    it('should update user name', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({ name: 'Jane Smith' })
        .expect(200)
        .then(response => {
          expect(response.body.name).toBe('Jane Smith')
          expect(response.body.email).toBe('john@example.com')
        })
    })

    it('should update user email', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({ email: 'jane.smith@example.com' })
        .expect(200)
        .then(response => {
          expect(response.body.email).toBe('jane.smith@example.com')
        })
    })

    it('should update both name and email', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({ name: 'Updated Name', email: 'updated@example.com' })
        .expect(200)
        .then(response => {
          expect(response.body.name).toBe('Updated Name')
          expect(response.body.email).toBe('updated@example.com')
        })
    })

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .put('/users/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect(404)
    })

    it('should return 500 when updating with invalid email', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({ email: 'invalid-email' })
        .expect(500)
    })

    it('should return 500 when updating with name too short', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({ name: 'J' })
        .expect(500)
    })
  })
})
