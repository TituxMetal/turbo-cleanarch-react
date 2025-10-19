import { NotFoundException } from '@nestjs/common'

import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { InMemoryTaskRepository } from '~/task/infrastructure/adapters/inMemoryTask.repository'

import { DeleteTaskUseCase } from './deleteTask.uc'

describe('DeleteTaskUseCase', () => {
  let deleteTaskUseCase: DeleteTaskUseCase
  let taskRepository: TaskRepositoryPort

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository()
    deleteTaskUseCase = new DeleteTaskUseCase(taskRepository)
  })

  describe('execute', () => {
    it('should delete a task successfully', async () => {
      const task = TaskEntity.create('Test Task', 'Test Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()

      await deleteTaskUseCase.execute(taskId)

      const deletedTask = await taskRepository.findById(taskId)
      expect(deletedTask).toBeNull()
    })

    it('should throw NotFoundException when task does not exist', async () => {
      const nonExistentId = 'non-existent-id'

      await expect(deleteTaskUseCase.execute(nonExistentId)).rejects.toThrow(NotFoundException)
      await expect(deleteTaskUseCase.execute(nonExistentId)).rejects.toThrow('Task not found')
    })

    it('should not call repository delete when task not found', async () => {
      const nonExistentId = 'non-existent-id'
      const deleteSpy = jest.spyOn(taskRepository, 'delete')

      await expect(deleteTaskUseCase.execute(nonExistentId)).rejects.toThrow(NotFoundException)

      expect(deleteSpy).not.toHaveBeenCalled()
    })

    it('should call repository findById with correct ID', async () => {
      const task = TaskEntity.create('Test Task', 'Test Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const findByIdSpy = jest.spyOn(taskRepository, 'findById')

      await deleteTaskUseCase.execute(taskId)

      expect(findByIdSpy).toHaveBeenCalledTimes(1)
      expect(findByIdSpy).toHaveBeenCalledWith(taskId)
    })

    it('should call repository delete with correct ID', async () => {
      const task = TaskEntity.create('Test Task', 'Test Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const deleteSpy = jest.spyOn(taskRepository, 'delete')

      await deleteTaskUseCase.execute(taskId)

      expect(deleteSpy).toHaveBeenCalledTimes(1)
      expect(deleteSpy).toHaveBeenCalledWith(taskId)
    })

    it('should throw NotFoundException when deleting from empty repository', async () => {
      const taskId = 'any-id'

      await expect(deleteTaskUseCase.execute(taskId)).rejects.toThrow(NotFoundException)
      await expect(deleteTaskUseCase.execute(taskId)).rejects.toThrow('Task not found')
    })

    it('should delete only the specified task', async () => {
      const task1 = TaskEntity.create('Task 1', 'Description 1', 'user-1')
      const task2 = TaskEntity.create('Task 2', 'Description 2', 'user-2')
      await taskRepository.save(task1)
      await taskRepository.save(task2)
      const task1Id = task1.getId().getValue()
      const task2Id = task2.getId().getValue()

      await deleteTaskUseCase.execute(task1Id)

      const deletedTask = await taskRepository.findById(task1Id)
      const remainingTask = await taskRepository.findById(task2Id)
      expect(deletedTask).toBeNull()
      expect(remainingTask).toBe(task2)
    })
  })

  describe('error handling', () => {
    it('should propagate repository findById errors', async () => {
      const errorMessage = 'Repository findById operation failed'
      const mockRepository = {
        findById: jest.fn().mockRejectedValue(new Error(errorMessage)),
        delete: jest.fn()
      } as unknown as TaskRepositoryPort

      const useCase = new DeleteTaskUseCase(mockRepository)

      await expect(useCase.execute('task-id')).rejects.toThrow(errorMessage)
    })

    it('should propagate repository delete errors', async () => {
      const errorMessage = 'Repository delete operation failed'
      const task = TaskEntity.create('Test Task', 'Test Description', 'user-123')
      const mockRepository = {
        findById: jest.fn().mockResolvedValue(task),
        delete: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as TaskRepositoryPort

      const useCase = new DeleteTaskUseCase(mockRepository)

      await expect(useCase.execute('task-id')).rejects.toThrow(errorMessage)
    })
  })
})
