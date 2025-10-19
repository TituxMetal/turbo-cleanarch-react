import { NotFoundException } from '@nestjs/common'
import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'
import { UserRepositoryPort } from '~/user/application/ports/user.repository'
import { UserEntity } from '~/user/domain/entities/user.entity'
import { CreateTaskUseCase } from './createTask.uc'

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase
  let taskRepository: TaskRepositoryPort
  let userRepository: UserRepositoryPort

  beforeEach(() => {
    taskRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    }

    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    }

    useCase = new CreateTaskUseCase(taskRepository, userRepository)
  })

  it('should create a task when user exists', async () => {
    const userId = 'user-123'
    const user = UserEntity.create('Test User', 'test@example.com')
    const dto = {
      title: 'Test Task',
      description: 'Test Description',
      userId
    }
    const mockUserFindById = userRepository.findById as jest.Mock
    const mockTaskSave = taskRepository.save as jest.Mock

    mockUserFindById.mockResolvedValue(user)
    mockTaskSave.mockImplementation((task: TaskEntity) => task)

    const result = await useCase.execute(dto)

    expect(userRepository.findById).toHaveBeenCalledWith(userId)
    expect(taskRepository.save).toHaveBeenCalled()
    expect(result).toBeInstanceOf(TaskEntity)
    expect(result.getTitle()).toBe('Test Task')
    expect(result.getDescription()).toBe('Test Description')
    expect(result.getUserId().getValue()).toBe(userId)
  })

  it('should throw NotFoundException when user does not exist', async () => {
    const dto = {
      title: 'Test Task',
      description: 'Test Description',
      userId: 'non-existent-user'
    }
    const mockUserFindById = userRepository.findById as jest.Mock

    mockUserFindById.mockResolvedValue(null)

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException)
    expect(taskRepository.save).not.toHaveBeenCalled()
  })

  it('should throw error when title is invalid', async () => {
    const userId = 'user-123'
    const user = UserEntity.create('Test User', 'test@example.com')
    const dto = {
      title: '',
      description: 'Test Description',
      userId
    }
    const mockUserFindById = userRepository.findById as jest.Mock

    mockUserFindById.mockResolvedValue(user)

    await expect(useCase.execute(dto)).rejects.toThrow('Task title cannot be empty')
    expect(taskRepository.save).not.toHaveBeenCalled()
  })
})
