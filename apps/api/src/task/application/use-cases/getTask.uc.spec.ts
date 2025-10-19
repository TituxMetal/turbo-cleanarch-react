import { NotFoundException } from '@nestjs/common'

import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { InMemoryTaskRepository } from '~/task/infrastructure/adapters/inMemoryTask.repository'

import { GetTaskUseCase } from './getTask.uc'

describe('GetTaskUseCase', () => {
  let getTaskUseCase: GetTaskUseCase
  let taskRepository: TaskRepositoryPort

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository()
    getTaskUseCase = new GetTaskUseCase(taskRepository)
  })

  describe('execute', () => {
    it('should return a task when found by valid ID', async () => {
      const taskData = { title: 'Test Task', description: 'Test Description', userId: 'user-123' }
      const createdTask = TaskEntity.create(taskData.title, taskData.description, taskData.userId)
      await taskRepository.save(createdTask)
      const taskId = createdTask.getId().getValue()

      const result = await getTaskUseCase.execute(taskId)

      expect(result).toBeInstanceOf(TaskEntity)
      expect(result.getId().getValue()).toBe(taskId)
      expect(result.getTitle()).toBe(taskData.title)
      expect(result.getDescription()).toBe(taskData.description)
      expect(result.getUserId().getValue()).toBe(taskData.userId)
      expect(result.getStatus().getValue()).toBe('TODO')
      expect(result.getCreatedAt()).toBeInstanceOf(Date)
      expect(result.getUpdatedAt()).toBeInstanceOf(Date)
    })

    it('should throw NotFoundException when task is not found', async () => {
      const nonExistentId = 'non-existent-id'

      await expect(getTaskUseCase.execute(nonExistentId)).rejects.toThrow(NotFoundException)
      await expect(getTaskUseCase.execute(nonExistentId)).rejects.toThrow('Task not found')
    })

    it('should throw NotFoundException when task ID is empty string', async () => {
      const emptyId = ''

      await expect(getTaskUseCase.execute(emptyId)).rejects.toThrow(NotFoundException)
    })

    it('should call repository findById with correct ID', async () => {
      const taskData = { title: 'Test Task', description: 'Test Description', userId: 'user-123' }
      const createdTask = TaskEntity.create(taskData.title, taskData.description, taskData.userId)
      await taskRepository.save(createdTask)
      const taskId = createdTask.getId().getValue()

      const findByIdSpy = jest.spyOn(taskRepository, 'findById')

      await getTaskUseCase.execute(taskId)

      expect(findByIdSpy).toHaveBeenCalledTimes(1)
      expect(findByIdSpy).toHaveBeenCalledWith(taskId)
    })

    it('should return the exact same task entity from repository', async () => {
      const taskData = { title: 'Test Task', description: 'Test Description', userId: 'user-123' }
      const createdTask = TaskEntity.create(taskData.title, taskData.description, taskData.userId)
      await taskRepository.save(createdTask)
      const taskId = createdTask.getId().getValue()

      const result = await getTaskUseCase.execute(taskId)

      expect(result).toBe(createdTask)
    })

    it('should handle multiple tasks and return the correct one', async () => {
      const task1 = TaskEntity.create('Task One', 'Description One', 'user-1')
      const task2 = TaskEntity.create('Task Two', 'Description Two', 'user-2')
      const task3 = TaskEntity.create('Task Three', 'Description Three', 'user-3')

      await taskRepository.save(task1)
      await taskRepository.save(task2)
      await taskRepository.save(task3)

      const result = await getTaskUseCase.execute(task2.getId().getValue())

      expect(result.getId().getValue()).toBe(task2.getId().getValue())
      expect(result.getTitle()).toBe('Task Two')
      expect(result.getDescription()).toBe('Description Two')
      expect(result.getUserId().getValue()).toBe('user-2')
    })
  })

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      const errorMessage = 'Repository operation failed'
      const mockRepository = {
        findById: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as TaskRepositoryPort

      const useCase = new GetTaskUseCase(mockRepository)

      await expect(useCase.execute('any-id')).rejects.toThrow(errorMessage)
    })
  })
})
