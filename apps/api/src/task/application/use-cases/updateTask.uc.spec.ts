import { NotFoundException } from '@nestjs/common'

import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { TaskStatusEnum } from '~/task/domain/value-objects/taskStatus.vo'
import { InMemoryTaskRepository } from '~/task/infrastructure/adapters/inMemoryTask.repository'

import { UpdateTaskUseCase } from './updateTask.uc'

describe('UpdateTaskUseCase', () => {
  let updateTaskUseCase: UpdateTaskUseCase
  let taskRepository: TaskRepositoryPort

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository()
    updateTaskUseCase = new UpdateTaskUseCase(taskRepository)
  })

  describe('execute', () => {
    it('should update task title successfully', async () => {
      const task = TaskEntity.create('Old Title', 'Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const updateData = { title: 'New Title' }

      const result = await updateTaskUseCase.execute(taskId, updateData)

      expect(result).toBeInstanceOf(TaskEntity)
      expect(result.getTitle()).toBe('New Title')
      expect(result.getDescription()).toBe('Description')
      expect(result.getId().getValue()).toBe(taskId)
    })

    it('should update task description successfully', async () => {
      const task = TaskEntity.create('Title', 'Old Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const updateData = { description: 'New Description' }

      const result = await updateTaskUseCase.execute(taskId, updateData)

      expect(result).toBeInstanceOf(TaskEntity)
      expect(result.getTitle()).toBe('Title')
      expect(result.getDescription()).toBe('New Description')
      expect(result.getId().getValue()).toBe(taskId)
    })

    it('should update task status to COMPLETED', async () => {
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const updateData = { status: TaskStatusEnum.COMPLETED }

      const result = await updateTaskUseCase.execute(taskId, updateData)

      expect(result.getStatus().getValue()).toBe(TaskStatusEnum.COMPLETED)
      expect(result.getCompletedAt()).toBeInstanceOf(Date)
    })

    it('should update task status to IN_PROGRESS', async () => {
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const updateData = { status: TaskStatusEnum.IN_PROGRESS }

      const result = await updateTaskUseCase.execute(taskId, updateData)

      expect(result.getStatus().getValue()).toBe(TaskStatusEnum.IN_PROGRESS)
    })

    it('should update task status to TODO', async () => {
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      await taskRepository.save(task)
      task.markAsCompleted()
      const taskId = task.getId().getValue()
      const updateData = { status: TaskStatusEnum.TODO }

      const result = await updateTaskUseCase.execute(taskId, updateData)

      expect(result.getStatus().getValue()).toBe(TaskStatusEnum.TODO)
      expect(result.getCompletedAt()).toBeNull()
    })

    it('should update multiple fields at once', async () => {
      const task = TaskEntity.create('Old Title', 'Old Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const updateData = {
        title: 'New Title',
        description: 'New Description',
        status: TaskStatusEnum.IN_PROGRESS
      }

      const result = await updateTaskUseCase.execute(taskId, updateData)

      expect(result.getTitle()).toBe('New Title')
      expect(result.getDescription()).toBe('New Description')
      expect(result.getStatus().getValue()).toBe(TaskStatusEnum.IN_PROGRESS)
    })

    it('should not update anything when no fields provided', async () => {
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const originalTitle = task.getTitle()
      const originalDescription = task.getDescription()
      const updateData = {}

      const result = await updateTaskUseCase.execute(taskId, updateData)

      expect(result.getTitle()).toBe(originalTitle)
      expect(result.getDescription()).toBe(originalDescription)
    })

    it('should update updatedAt timestamp', async () => {
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const originalUpdatedAt = task.getUpdatedAt()

      await new Promise(resolve => setTimeout(resolve, 1))

      const result = await updateTaskUseCase.execute(taskId, { title: 'New Title' })

      expect(result.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    it('should throw NotFoundException when task does not exist', async () => {
      const nonExistentId = 'non-existent-id'
      const updateData = { title: 'New Title' }

      await expect(updateTaskUseCase.execute(nonExistentId, updateData)).rejects.toThrow(
        NotFoundException
      )
      await expect(updateTaskUseCase.execute(nonExistentId, updateData)).rejects.toThrow(
        'Task not found'
      )
    })

    it('should call repository findById with correct ID', async () => {
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const findByIdSpy = jest.spyOn(taskRepository, 'findById')

      await updateTaskUseCase.execute(taskId, { title: 'New Title' })

      expect(findByIdSpy).toHaveBeenCalledTimes(1)
      expect(findByIdSpy).toHaveBeenCalledWith(taskId)
    })

    it('should call repository save with updated task', async () => {
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      const saveSpy = jest.spyOn(taskRepository, 'save')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()

      await updateTaskUseCase.execute(taskId, { title: 'New Title' })

      expect(saveSpy).toHaveBeenCalledTimes(2) // Once in setup, once in execute
      expect(saveSpy).toHaveBeenCalledWith(task)
    })
  })

  describe('validation errors', () => {
    it('should throw error for empty title', async () => {
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()

      await expect(updateTaskUseCase.execute(taskId, { title: '' })).rejects.toThrow(
        'Task title cannot be empty'
      )
    })

    it('should throw error for title with only whitespace', async () => {
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()

      await expect(updateTaskUseCase.execute(taskId, { title: '   ' })).rejects.toThrow(
        'Task title cannot be empty'
      )
    })

    it('should not save task when title is invalid', async () => {
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      await taskRepository.save(task)
      const taskId = task.getId().getValue()
      const saveSpy = jest.spyOn(taskRepository, 'save')
      saveSpy.mockClear() // Clear the save from beforeEach

      await expect(updateTaskUseCase.execute(taskId, { title: '' })).rejects.toThrow()

      expect(saveSpy).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should propagate repository findById errors', async () => {
      const errorMessage = 'Repository findById operation failed'
      const mockRepository = {
        findById: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as TaskRepositoryPort

      const useCase = new UpdateTaskUseCase(mockRepository)

      await expect(useCase.execute('task-id', { title: 'New Title' })).rejects.toThrow(errorMessage)
    })

    it('should propagate repository save errors', async () => {
      const errorMessage = 'Repository save operation failed'
      const task = TaskEntity.create('Title', 'Description', 'user-123')
      const mockRepository = {
        findById: jest.fn().mockResolvedValue(task),
        save: jest.fn().mockRejectedValue(new Error(errorMessage))
      } as unknown as TaskRepositoryPort

      const useCase = new UpdateTaskUseCase(mockRepository)

      await expect(useCase.execute('task-id', { title: 'New Title' })).rejects.toThrow(errorMessage)
    })
  })
})
