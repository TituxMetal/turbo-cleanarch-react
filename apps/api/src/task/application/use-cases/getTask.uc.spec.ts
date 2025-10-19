import { NotFoundException } from '@nestjs/common'
import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { GetTaskUseCase } from './getTask.uc'

describe('GetTaskUseCase', () => {
  let useCase: GetTaskUseCase
  let taskRepository: TaskRepositoryPort

  beforeEach(() => {
    taskRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    }

    useCase = new GetTaskUseCase(taskRepository)
  })

  it('should return task when it exists', async () => {
    const taskId = 'task-123'
    const task = TaskEntity.create('Test Task', 'Test Description', 'user-123')
    const mockFindById = taskRepository.findById as jest.Mock

    mockFindById.mockResolvedValue(task)

    const result = await useCase.execute(taskId)

    expect(taskRepository.findById).toHaveBeenCalledWith(taskId)
    expect(result).toBe(task)
  })

  it('should throw NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-task'
    const mockFindById = taskRepository.findById as jest.Mock

    mockFindById.mockResolvedValue(null)

    await expect(useCase.execute(taskId)).rejects.toThrow(NotFoundException)
    await expect(useCase.execute(taskId)).rejects.toThrow('Task not found')
  })
})
