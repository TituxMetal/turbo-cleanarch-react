import { NotFoundException } from '@nestjs/common'
import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { DeleteTaskUseCase } from './deleteTask.uc'

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase
  let taskRepository: TaskRepositoryPort

  beforeEach(() => {
    taskRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    }

    useCase = new DeleteTaskUseCase(taskRepository)
  })

  it('should delete task when it exists', async () => {
    const taskId = 'task-123'
    const task = TaskEntity.create('Test Task', 'Test Description', 'user-123')
    const mockFindById = taskRepository.findById as jest.Mock
    const mockDelete = taskRepository.delete as jest.Mock

    mockFindById.mockResolvedValue(task)
    mockDelete.mockResolvedValue(undefined)

    await useCase.execute(taskId)

    expect(taskRepository.findById).toHaveBeenCalledWith(taskId)
    expect(taskRepository.delete).toHaveBeenCalledWith(taskId)
  })

  it('should throw NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-task'
    const mockFindById = taskRepository.findById as jest.Mock

    mockFindById.mockResolvedValue(null)

    await expect(useCase.execute(taskId)).rejects.toThrow(NotFoundException)
    await expect(useCase.execute(taskId)).rejects.toThrow('Task not found')
    expect(taskRepository.delete).not.toHaveBeenCalled()
  })
})
