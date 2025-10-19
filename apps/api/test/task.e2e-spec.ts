import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { AppModule } from '../src/app.module'

describe('Task API (e2e)', () => {
  let app: INestApplication
  let createdUserId: string
  let createdTaskId: string

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

  describe('/users (POST) - Create a user for testing', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Test User', email: 'test@example.com' })
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('id')
          expect(response.body.name).toBe('Test User')
          createdUserId = response.body.id
        })
    })
  })

  describe('/tasks (POST)', () => {
    it('should create a task', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description',
          userId: createdUserId
        })
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('id')
          expect(response.body.title).toBe('Test Task')
          expect(response.body.description).toBe('Test Description')
          expect(response.body.status).toBe('TODO')
          expect(response.body.userId).toBe(createdUserId)
          expect(response.body).toHaveProperty('createdAt')
          expect(response.body).toHaveProperty('updatedAt')
          expect(response.body.completedAt).toBeNull()
          createdTaskId = response.body.id
        })
    })

    it('should return 404 when creating task for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description',
          userId: 'non-existent-user'
        })
        .expect(404)
    })

    it('should return 500 when creating task with empty title', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: '',
          description: 'Test Description',
          userId: createdUserId
        })
        .expect(500)
    })
  })

  describe('/tasks/:id (GET)', () => {
    it('should get a task by id', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(200)
        .then(response => {
          expect(response.body.id).toBe(createdTaskId)
          expect(response.body.title).toBe('Test Task')
          expect(response.body.description).toBe('Test Description')
        })
    })

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer()).get('/tasks/non-existent-id').expect(404)
    })
  })

  describe('/tasks (GET)', () => {
    it('should list all tasks', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBe(true)
          expect(response.body.length).toBeGreaterThan(0)
        })
    })

    it('should filter tasks by userId', () => {
      return request(app.getHttpServer())
        .get(`/tasks?userId=${createdUserId}`)
        .expect(200)
        .then(response => {
          expect(Array.isArray(response.body)).toBe(true)
          expect(response.body.every((task: any) => task.userId === createdUserId)).toBe(true)
        })
    })
  })

  describe('/tasks/:id (PUT)', () => {
    it('should update task title', () => {
      return request(app.getHttpServer())
        .put(`/tasks/${createdTaskId}`)
        .send({ title: 'Updated Task Title' })
        .expect(200)
        .then(response => {
          expect(response.body.title).toBe('Updated Task Title')
          expect(response.body.description).toBe('Test Description')
        })
    })

    it('should update task description', () => {
      return request(app.getHttpServer())
        .put(`/tasks/${createdTaskId}`)
        .send({ description: 'Updated Description' })
        .expect(200)
        .then(response => {
          expect(response.body.description).toBe('Updated Description')
        })
    })

    it('should update task status', () => {
      return request(app.getHttpServer())
        .put(`/tasks/${createdTaskId}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200)
        .then(response => {
          expect(response.body.status).toBe('IN_PROGRESS')
        })
    })

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .put('/tasks/non-existent-id')
        .send({ title: 'Updated Title' })
        .expect(404)
    })
  })

  describe('/tasks/:id/complete (PATCH)', () => {
    it('should mark task as completed', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}/complete`)
        .expect(200)
        .then(response => {
          expect(response.body.status).toBe('COMPLETED')
          expect(response.body.completedAt).not.toBeNull()
        })
    })
  })

  describe('/tasks/:id (DELETE)', () => {
    it('should delete a task', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${createdTaskId}`)
        .expect(200)
        .then(response => {
          expect(response.body.message).toBe('Task deleted successfully')
        })
    })

    it('should return 404 when deleting non-existent task', () => {
      return request(app.getHttpServer()).delete(`/tasks/${createdTaskId}`).expect(404)
    })
  })
})
