import { NotFoundException } from '@nestjs/common'

import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { InMemoryTaskRepository } from '~/task/infrastructure/adapters/inMemoryTask.repository'
import { UserRepositoryPort } from '~/user/application/ports/user.repository'
import { UserEntity } from '~/user/domain/entities/user.entity'
import { InMemoryUserRepository } from '~/user/infrastructure/adapters/inMemoryUser.repository'

import { CreateTaskUseCase } from './createTask.uc'

describe('CreateTaskUseCase', () => {
  let createTaskUseCase: CreateTaskUseCase
  let taskRepository: TaskRepositoryPort
  let userRepository: UserRepositoryPort
  let testUser: UserEntity

  beforeEach(async () => {
    taskRepository = new InMemoryTaskRepository()
    userRepository = new InMemoryUserRepository()
    createTaskUseCase = new CreateTaskUseCase(taskRepository, userRepository)

    // Create a test user for task creation
    testUser = await userRepository.save(UserEntity.create('Test User', 'test@example.com'))
  })

  describe('execute', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        userId: testUser.getId().getValue()
      }

      const result = await createTaskUseCase.execute(taskData)

      expect(result).toBeInstanceOf(TaskEntity)
      expect(result.getTitle()).toBe(taskData.title)
      expect(result.getDescription()).toBe(taskData.description)
      expect(result.getUserId().getValue()).toBe(taskData.userId)
      expect(result.getId().getValue()).toBeDefined()
      expect(result.getStatus().getValue()).toBe('TODO')
      expect(result.getCreatedAt()).toBeInstanceOf(Date)
      expect(result.getUpdatedAt()).toBeInstanceOf(Date)
    })

    it('should throw NotFoundException when user does not exist', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        userId: 'non-existent-user-id'
      }

      await expect(createTaskUseCase.execute(taskData)).rejects.toThrow(NotFoundException)
      await expect(createTaskUseCase.execute(taskData)).rejects.toThrow('User not found')
    })

    it('should not save task when user does not exist', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        userId: 'non-existent-user-id'
      }
      const saveSpy = jest.spyOn(taskRepository, 'save')

      await expect(createTaskUseCase.execute(taskData)).rejects.toThrow(NotFoundException)

      expect(saveSpy).not.toHaveBeenCalled()
    })

    it('should call userRepository findById with correct userId', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        userId: testUser.getId().getValue()
      }
      const findByIdSpy = jest.spyOn(userRepository, 'findById')

      await createTaskUseCase.execute(taskData)

      expect(findByIdSpy).toHaveBeenCalledTimes(1)
      expect(findByIdSpy).toHaveBeenCalledWith(taskData.userId)
    })

    it('should call taskRepository save with correct task entity', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        userId: testUser.getId().getValue()
      }
      const saveSpy = jest.spyOn(taskRepository, 'save')

      await createTaskUseCase.execute(taskData)

      expect(saveSpy).toHaveBeenCalledTimes(1)
      expect(saveSpy).toHaveBeenCalledWith(expect.any(TaskEntity))

      const savedTask = saveSpy.mock.calls[0][0] as TaskEntity
      expect(savedTask.getTitle()).toBe(taskData.title)
      expect(savedTask.getDescription()).toBe(taskData.description)
      expect(savedTask.getUserId().getValue()).toBe(taskData.userId)
    })

    it('should return the saved task entity from repository', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        userId: testUser.getId().getValue()
      }

      const result = await createTaskUseCase.execute(taskData)
      const foundTask = await taskRepository.findById(result.getId().getValue())

      expect(result).toBe(foundTask)
    })

    it('should create multiple tasks for the same user', async () => {
      const task1Data = {
        title: 'Task One',
        description: 'Description One',
        userId: testUser.getId().getValue()
      }
      const task2Data = {
        title: 'Task Two',
        description: 'Description Two',
        userId: testUser.getId().getValue()
      }

      const result1 = await createTaskUseCase.execute(task1Data)
      const result2 = await createTaskUseCase.execute(task2Data)

      expect(result1.getTitle()).toBe(task1Data.title)
      expect(result2.getTitle()).toBe(task2Data.title)
      expect(result1.getId().getValue()).not.toBe(result2.getId().getValue())
      expect(result1.getUserId().getValue()).toBe(result2.getUserId().getValue())
    })

    it('should create tasks for different users', async () => {
      const user2 = await userRepository.save(UserEntity.create('User Two', 'user2@example.com'))
      const task1Data = {
        title: 'Task for User 1',
        description: 'Description 1',
        userId: testUser.getId().getValue()
      }
      const task2Data = {
        title: 'Task for User 2',
        description: 'Description 2',
        userId: user2.getId().getValue()
      }

      const result1 = await createTaskUseCase.execute(task1Data)
      const result2 = await createTaskUseCase.execute(task2Data)

      expect(result1.getUserId().getValue()).toBe(testUser.getId().getValue())
      expect(result2.getUserId().getValue()).toBe(user2.getId().getValue())
      expect(result1.getId().getValue()).not.toBe(result2.getId().getValue())
    })
  })

  describe('validation errors', () => {
    it('should throw error for empty title', async () => {
      const taskData = {
        title: '',
        description: 'Test Description',
        userId: testUser.getId().getValue()
      }

      await expect(createTaskUseCase.execute(taskData)).rejects.toThrow(
        'Task title cannot be empty'
      )
    })

    it('should not save task when title is empty', async () => {
      const taskData = {
        title: '',
        description: 'Test Description',
        userId: testUser.getId().getValue()
      }
      const saveSpy = jest.spyOn(taskRepository, 'save')

      await expect(createTaskUseCase.execute(taskData)).rejects.toThrow()

      expect(saveSpy).not.toHaveBeenCalled()
    })

    it('should throw error for title with only whitespace', async () => {
      const taskData = {
        title: '   ',
        description: 'Test Description',
        userId: testUser.getId().getValue()
      }

      await expect(createTaskUseCase.execute(taskData)).rejects.toThrow(
        'Task title cannot be empty'
      )
    })

    it('should allow empty description', async () => {
      const taskData = {
        title: 'Test Task',
        description: '',
        userId: testUser.getId().getValue()
      }

      const result = await createTaskUseCase.execute(taskData)

      expect(result).toBeInstanceOf(TaskEntity)
      expect(result.getDescription()).toBe('')
    })

    it('should trim whitespace from description', async () => {
      const taskData = {
        title: 'Test Task',
        description: '   Test Description   ',
        userId: testUser.getId().getValue()
      }

      const result = await createTaskUseCase.execute(taskData)

      expect(result.getDescription()).toBe('Test Description')
    })
  })

  describe('error handling', () => {
    it('should propagate repository findById errors', async () => {
      const errorMessage = 'Repository findById operation failed'
      const mockUserRepository = {
        findById: jest.fn().mockRejectedValue(new Error(errorMessage)),
        save: jest.fn()
      } as unknown as UserRepositoryPort

      const useCase = new CreateTaskUseCase(taskRepository, mockUserRepository)

      await expect(
        useCase.execute({
          title: 'Test Task',
          description: 'Test Description',
          userId: 'user-id'
        })
      ).rejects.toThrow(errorMessage)
    })

    it('should propagate repository save errors', async () => {
      const errorMessage = 'Repository save operation failed'
      const mockTaskRepository = {
        save: jest.fn().mockRejectedValue(new Error(errorMessage)),
        findById: jest.fn()
      } as unknown as TaskRepositoryPort

      const useCase = new CreateTaskUseCase(mockTaskRepository, userRepository)

      await expect(
        useCase.execute({
          title: 'Test Task',
          description: 'Test Description',
          userId: testUser.getId().getValue()
        })
      ).rejects.toThrow(errorMessage)
    })
  })
})
