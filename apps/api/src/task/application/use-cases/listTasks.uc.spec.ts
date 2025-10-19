import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { InMemoryTaskRepository } from '~/task/infrastructure/adapters/inMemoryTask.repository'

import { ListTasksUseCase } from './listTasks.uc'

describe('ListTasksUseCase', () => {
  let listTasksUseCase: ListTasksUseCase
  let taskRepository: TaskRepositoryPort

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository()
    listTasksUseCase = new ListTasksUseCase(taskRepository)
  })

  describe('execute', () => {
    it('should return an empty array when no tasks exist', async () => {
      const result = await listTasksUseCase.execute()

      expect(result).toEqual([])
    })

    it('should return all tasks when no userId is provided', async () => {
      const task1 = TaskEntity.create('Task 1', 'Description 1', 'user-1')
      const task2 = TaskEntity.create('Task 2', 'Description 2', 'user-2')

      await taskRepository.save(task1)
      await taskRepository.save(task2)

      const result = await listTasksUseCase.execute()

      expect(result).toHaveLength(2)
      expect(result).toContain(task1)
      expect(result).toContain(task2)
    })

    it('should return tasks for specific user when userId is provided', async () => {
      const userId = 'user-123'
      const task1 = TaskEntity.create('Task 1', 'Description 1', userId)
      const task2 = TaskEntity.create('Task 2', 'Description 2', userId)
      const task3 = TaskEntity.create('Task 3', 'Description 3', 'other-user')

      await taskRepository.save(task1)
      await taskRepository.save(task2)
      await taskRepository.save(task3)

      const result = await listTasksUseCase.execute(userId)

      expect(result).toHaveLength(2)
      expect(result).toContain(task1)
      expect(result).toContain(task2)
      expect(result).not.toContain(task3)
    })

    it('should return empty array when user has no tasks', async () => {
      const task1 = TaskEntity.create('Task 1', 'Description 1', 'user-1')
      await taskRepository.save(task1)

      const result = await listTasksUseCase.execute('user-with-no-tasks')

      expect(result).toEqual([])
    })

    it('should call repository findAll when no userId provided', async () => {
      const findAllSpy = jest.spyOn(taskRepository, 'findAll')

      await listTasksUseCase.execute()

      expect(findAllSpy).toHaveBeenCalledTimes(1)
    })

    it('should call repository findByUserId when userId provided', async () => {
      const userId = 'user-123'
      const findByUserIdSpy = jest.spyOn(taskRepository, 'findByUserId')

      await listTasksUseCase.execute(userId)

      expect(findByUserIdSpy).toHaveBeenCalledTimes(1)
      expect(findByUserIdSpy).toHaveBeenCalledWith(userId)
    })

    it('should return tasks in the order they were saved', async () => {
      const task1 = TaskEntity.create('First Task', 'Description 1', 'user-1')
      const task2 = TaskEntity.create('Second Task', 'Description 2', 'user-2')
      const task3 = TaskEntity.create('Third Task', 'Description 3', 'user-3')

      await taskRepository.save(task1)
      await taskRepository.save(task2)
      await taskRepository.save(task3)

      const result = await listTasksUseCase.execute()

      expect(result[0].getTitle()).toBe('First Task')
      expect(result[1].getTitle()).toBe('Second Task')
      expect(result[2].getTitle()).toBe('Third Task')
    })

    it('should return multiple tasks for the same user', async () => {
      const userId = 'user-123'
      const task1 = TaskEntity.create('Task 1', 'Description 1', userId)
      const task2 = TaskEntity.create('Task 2', 'Description 2', userId)
      const task3 = TaskEntity.create('Task 3', 'Description 3', userId)

      await taskRepository.save(task1)
      await taskRepository.save(task2)
      await taskRepository.save(task3)

      const result = await listTasksUseCase.execute(userId)

      expect(result).toHaveLength(3)
      expect(result.every(task => task.getUserId().getValue() === userId)).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should propagate repository findAll errors', async () => {
      const errorMessage = 'Repository findAll operation failed'
      const mockRepository = {
        findAll: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as TaskRepositoryPort

      const useCase = new ListTasksUseCase(mockRepository)

      await expect(useCase.execute()).rejects.toThrow(errorMessage)
    })

    it('should propagate repository findByUserId errors', async () => {
      const errorMessage = 'Repository findByUserId operation failed'
      const mockRepository = {
        findByUserId: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as TaskRepositoryPort

      const useCase = new ListTasksUseCase(mockRepository)

      await expect(useCase.execute('user-123')).rejects.toThrow(errorMessage)
    })
  })
})
