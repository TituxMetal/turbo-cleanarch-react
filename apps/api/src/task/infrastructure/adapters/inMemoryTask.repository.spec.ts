import { InMemoryTaskRepository } from './inMemoryTask.repository'
import { TaskEntity } from '~/task/domain/entities/task.entity'

describe('InMemoryTaskRepository', () => {
  let repository: InMemoryTaskRepository

  beforeEach(() => {
    repository = new InMemoryTaskRepository()
  })

  describe('save', () => {
    it('should save a task and return it', () => {
      const task = TaskEntity.create('Test Task', 'Test Description', 'user-123')

      const result = repository.save(task)

      expect(result).toBe(task)
      expect(repository.findById(task.getId().getValue())).toBe(task)
    })

    it('should update an existing task', () => {
      const task = TaskEntity.create('Original Title', 'Original Description', 'user-123')
      repository.save(task)

      task.updateTitle('Updated Title')
      const result = repository.save(task)

      expect(result.getTitle()).toBe('Updated Title')
      expect(repository.findById(task.getId().getValue())?.getTitle()).toBe('Updated Title')
    })
  })

  describe('findById', () => {
    it('should return task when it exists', () => {
      const task = TaskEntity.create('Test Task', 'Test Description', 'user-123')
      repository.save(task)

      const result = repository.findById(task.getId().getValue())

      expect(result).toBe(task)
    })

    it('should return null when task does not exist', () => {
      const result = repository.findById('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('findByUserId', () => {
    it('should return all tasks for a specific user', () => {
      const userId = 'user-123'
      const task1 = TaskEntity.create('Task 1', 'Description 1', userId)
      const task2 = TaskEntity.create('Task 2', 'Description 2', userId)
      const task3 = TaskEntity.create('Task 3', 'Description 3', 'user-456')

      repository.save(task1)
      repository.save(task2)
      repository.save(task3)

      const result = repository.findByUserId(userId)

      expect(result).toHaveLength(2)
      expect(result).toContain(task1)
      expect(result).toContain(task2)
      expect(result).not.toContain(task3)
    })

    it('should return empty array when user has no tasks', () => {
      const result = repository.findByUserId('user-with-no-tasks')

      expect(result).toEqual([])
    })
  })

  describe('findAll', () => {
    it('should return all tasks', () => {
      const task1 = TaskEntity.create('Task 1', 'Description 1', 'user-123')
      const task2 = TaskEntity.create('Task 2', 'Description 2', 'user-456')

      repository.save(task1)
      repository.save(task2)

      const result = repository.findAll()

      expect(result).toHaveLength(2)
      expect(result).toContain(task1)
      expect(result).toContain(task2)
    })

    it('should return empty array when no tasks exist', () => {
      const result = repository.findAll()

      expect(result).toEqual([])
    })
  })

  describe('delete', () => {
    it('should delete an existing task', () => {
      const task = TaskEntity.create('Test Task', 'Test Description', 'user-123')
      repository.save(task)

      repository.delete(task.getId().getValue())

      expect(repository.findById(task.getId().getValue())).toBeNull()
    })

    it('should do nothing when deleting non-existent task', () => {
      repository.delete('non-existent-id')

      expect(repository.findAll()).toHaveLength(0)
    })
  })
})
