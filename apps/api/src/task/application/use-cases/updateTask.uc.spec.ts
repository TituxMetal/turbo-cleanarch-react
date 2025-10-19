import { NotFoundException } from '@nestjs/common'
import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { TaskStatusEnum } from '~/task/domain/value-objects/taskStatus.vo'
import { UpdateTaskUseCase } from './updateTask.uc'

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase
  let taskRepository: TaskRepositoryPort

  beforeEach(() => {
    taskRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    }

    useCase = new UpdateTaskUseCase(taskRepository)
  })

  it('should update task title', async () => {
    const taskId = 'task-123'
    const task = TaskEntity.create('Old Title', 'Description', 'user-123')
    const mockFindById = taskRepository.findById as jest.Mock
    const mockSave = taskRepository.save as jest.Mock

    mockFindById.mockResolvedValue(task)
    mockSave.mockImplementation((t: TaskEntity) => t)

    const result = await useCase.execute(taskId, { title: 'New Title' })

    expect(result.getTitle()).toBe('New Title')
    expect(taskRepository.save).toHaveBeenCalledWith(task)
  })

  it('should update task description', async () => {
    const taskId = 'task-123'
    const task = TaskEntity.create('Title', 'Old Description', 'user-123')
    const mockFindById = taskRepository.findById as jest.Mock
    const mockSave = taskRepository.save as jest.Mock

    mockFindById.mockResolvedValue(task)
    mockSave.mockImplementation((t: TaskEntity) => t)

    const result = await useCase.execute(taskId, { description: 'New Description' })

    expect(result.getDescription()).toBe('New Description')
    expect(taskRepository.save).toHaveBeenCalledWith(task)
  })

  it('should update task status to COMPLETED', async () => {
    const taskId = 'task-123'
    const task = TaskEntity.create('Title', 'Description', 'user-123')
    const mockFindById = taskRepository.findById as jest.Mock
    const mockSave = taskRepository.save as jest.Mock

    mockFindById.mockResolvedValue(task)
    mockSave.mockImplementation((t: TaskEntity) => t)

    const result = await useCase.execute(taskId, { status: TaskStatusEnum.COMPLETED })

    expect(result.getStatus().getValue()).toBe(TaskStatusEnum.COMPLETED)
    expect(result.getCompletedAt()).toBeInstanceOf(Date)
    expect(taskRepository.save).toHaveBeenCalledWith(task)
  })

  it('should update task status to IN_PROGRESS', async () => {
    const taskId = 'task-123'
    const task = TaskEntity.create('Title', 'Description', 'user-123')
    const mockFindById = taskRepository.findById as jest.Mock
    const mockSave = taskRepository.save as jest.Mock

    mockFindById.mockResolvedValue(task)
    mockSave.mockImplementation((t: TaskEntity) => t)

    const result = await useCase.execute(taskId, { status: TaskStatusEnum.IN_PROGRESS })

    expect(result.getStatus().getValue()).toBe(TaskStatusEnum.IN_PROGRESS)
    expect(taskRepository.save).toHaveBeenCalledWith(task)
  })

  it('should update task status to TODO', async () => {
    const taskId = 'task-123'
    const task = TaskEntity.create('Title', 'Description', 'user-123')
    task.markAsCompleted()
    const mockFindById = taskRepository.findById as jest.Mock
    const mockSave = taskRepository.save as jest.Mock

    mockFindById.mockResolvedValue(task)
    mockSave.mockImplementation((t: TaskEntity) => t)

    const result = await useCase.execute(taskId, { status: TaskStatusEnum.TODO })

    expect(result.getStatus().getValue()).toBe(TaskStatusEnum.TODO)
    expect(result.getCompletedAt()).toBeNull()
    expect(taskRepository.save).toHaveBeenCalledWith(task)
  })

  it('should update multiple fields at once', async () => {
    const taskId = 'task-123'
    const task = TaskEntity.create('Old Title', 'Old Description', 'user-123')
    const mockFindById = taskRepository.findById as jest.Mock
    const mockSave = taskRepository.save as jest.Mock

    mockFindById.mockResolvedValue(task)
    mockSave.mockImplementation((t: TaskEntity) => t)

    const result = await useCase.execute(taskId, {
      title: 'New Title',
      description: 'New Description',
      status: TaskStatusEnum.IN_PROGRESS
    })

    expect(result.getTitle()).toBe('New Title')
    expect(result.getDescription()).toBe('New Description')
    expect(result.getStatus().getValue()).toBe(TaskStatusEnum.IN_PROGRESS)
    expect(taskRepository.save).toHaveBeenCalledWith(task)
  })

  it('should throw NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-task'
    const mockFindById = taskRepository.findById as jest.Mock

    mockFindById.mockResolvedValue(null)

    await expect(useCase.execute(taskId, { title: 'New Title' })).rejects.toThrow(NotFoundException)
    await expect(useCase.execute(taskId, { title: 'New Title' })).rejects.toThrow('Task not found')
    expect(taskRepository.save).not.toHaveBeenCalled()
  })

  it('should throw error when title is invalid', async () => {
    const taskId = 'task-123'
    const task = TaskEntity.create('Title', 'Description', 'user-123')
    const mockFindById = taskRepository.findById as jest.Mock

    mockFindById.mockResolvedValue(task)

    await expect(useCase.execute(taskId, { title: '' })).rejects.toThrow(
      'Task title cannot be empty'
    )
    expect(taskRepository.save).not.toHaveBeenCalled()
  })
})
