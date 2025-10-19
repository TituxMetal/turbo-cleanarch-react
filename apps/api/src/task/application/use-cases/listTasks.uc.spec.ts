import { ListTasksUseCase } from './listTasks.uc'
import { TaskRepositoryPort } from '~/task/application/ports/task.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'

describe('ListTasksUseCase', () => {
  let useCase: ListTasksUseCase
  let taskRepository: TaskRepositoryPort

  beforeEach(() => {
    taskRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    }

    useCase = new ListTasksUseCase(taskRepository)
  })

  it('should return all tasks when no userId is provided', async () => {
    const tasks = [
      TaskEntity.create('Task 1', 'Description 1', 'user-1'),
      TaskEntity.create('Task 2', 'Description 2', 'user-2')
    ]

    ;(taskRepository.findAll as jest.Mock).mockResolvedValue(tasks)

    const result = await useCase.execute()

    expect(taskRepository.findAll).toHaveBeenCalled()
    expect(taskRepository.findByUserId).not.toHaveBeenCalled()
    expect(result).toBe(tasks)
    expect(result).toHaveLength(2)
  })

  it('should return tasks for specific user when userId is provided', async () => {
    const userId = 'user-123'
    const tasks = [
      TaskEntity.create('Task 1', 'Description 1', userId),
      TaskEntity.create('Task 2', 'Description 2', userId)
    ]

    ;(taskRepository.findByUserId as jest.Mock).mockResolvedValue(tasks)

    const result = await useCase.execute(userId)

    expect(taskRepository.findByUserId).toHaveBeenCalledWith(userId)
    expect(taskRepository.findAll).not.toHaveBeenCalled()
    expect(result).toBe(tasks)
    expect(result).toHaveLength(2)
  })

  it('should return empty array when no tasks exist', async () => {
    ;(taskRepository.findAll as jest.Mock).mockResolvedValue([])

    const result = await useCase.execute()

    expect(result).toEqual([])
  })

  it('should return empty array when user has no tasks', async () => {
    const userId = 'user-with-no-tasks'

    ;(taskRepository.findByUserId as jest.Mock).mockResolvedValue([])

    const result = await useCase.execute(userId)

    expect(result).toEqual([])
  })
})
