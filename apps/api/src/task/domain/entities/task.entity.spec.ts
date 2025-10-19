import { TaskEntity } from './task.entity'
import { TaskStatusEnum } from '~/task/domain/value-objects/taskStatus.vo'
import { UserId } from '~/user/domain/value-objects/id.vo'

describe('TaskEntity', () => {
  const userId = 'user-123'
  let task: TaskEntity

  beforeEach(() => {
    task = TaskEntity.create('Test Task', 'Test Description', userId)
  })

  describe('create', () => {
    it('should create a new task with valid data', () => {
      expect(task.getTitle()).toBe('Test Task')
      expect(task.getDescription()).toBe('Test Description')
      expect(task.getUserId().getValue()).toBe(userId)
      expect(task.getStatus().getValue()).toBe(TaskStatusEnum.TODO)
      expect(task.getCompletedAt()).toBeNull()
      expect(task.getCreatedAt()).toBeInstanceOf(Date)
      expect(task.getUpdatedAt()).toBeInstanceOf(Date)
    })

    it('should trim whitespace from title and description', () => {
      const taskWithSpaces = TaskEntity.create('  Title  ', '  Description  ', userId)

      expect(taskWithSpaces.getTitle()).toBe('Title')
      expect(taskWithSpaces.getDescription()).toBe('Description')
    })

    it('should throw error when title is empty', () => {
      expect(() => TaskEntity.create('', 'Description', userId)).toThrow(
        'Task title cannot be empty'
      )
      expect(() => TaskEntity.create('   ', 'Description', userId)).toThrow(
        'Task title cannot be empty'
      )
    })

    it('should throw error when title exceeds 200 characters', () => {
      const longTitle = 'a'.repeat(201)

      expect(() => TaskEntity.create(longTitle, 'Description', userId)).toThrow(
        'Task title cannot exceed 200 characters'
      )
    })

    it('should throw error when description exceeds 2000 characters', () => {
      const longDescription = 'a'.repeat(2001)

      expect(() => TaskEntity.create('Title', longDescription, userId)).toThrow(
        'Task description cannot exceed 2000 characters'
      )
    })

    it('should allow description up to 2000 characters', () => {
      const validDescription = 'a'.repeat(2000)
      const task = TaskEntity.create('Title', validDescription, userId)

      expect(task.getDescription()).toBe(validDescription)
    })
  })

  describe('updateTitle', () => {
    it('should update title and updatedAt timestamp', async () => {
      const originalUpdatedAt = task.getUpdatedAt()

      await new Promise(resolve => setTimeout(resolve, 1))
      task.updateTitle('New Title')

      expect(task.getTitle()).toBe('New Title')
      expect(task.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    it('should trim whitespace from new title', () => {
      task.updateTitle('  New Title  ')

      expect(task.getTitle()).toBe('New Title')
    })

    it('should throw error when new title is empty', () => {
      expect(() => task.updateTitle('')).toThrow('Task title cannot be empty')
      expect(() => task.updateTitle('   ')).toThrow('Task title cannot be empty')
    })

    it('should throw error when new title exceeds 200 characters', () => {
      const longTitle = 'a'.repeat(201)

      expect(() => task.updateTitle(longTitle)).toThrow('Task title cannot exceed 200 characters')
    })
  })

  describe('updateDescription', () => {
    it('should update description and updatedAt timestamp', async () => {
      const originalUpdatedAt = task.getUpdatedAt()

      await new Promise(resolve => setTimeout(resolve, 1))
      task.updateDescription('New Description')

      expect(task.getDescription()).toBe('New Description')
      expect(task.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    it('should trim whitespace from new description', () => {
      task.updateDescription('  New Description  ')

      expect(task.getDescription()).toBe('New Description')
    })

    it('should throw error when new description exceeds 2000 characters', () => {
      const longDescription = 'a'.repeat(2001)

      expect(() => task.updateDescription(longDescription)).toThrow(
        'Task description cannot exceed 2000 characters'
      )
    })

    it('should allow empty description', () => {
      task.updateDescription('')

      expect(task.getDescription()).toBe('')
    })
  })

  describe('status transitions', () => {
    it('should mark task as in progress', () => {
      task.markAsInProgress()

      expect(task.getStatus().getValue()).toBe(TaskStatusEnum.IN_PROGRESS)
      expect(task.getCompletedAt()).toBeNull()
    })

    it('should mark task as completed with completedAt timestamp', () => {
      task.markAsCompleted()

      expect(task.getStatus().getValue()).toBe(TaskStatusEnum.COMPLETED)
      expect(task.getCompletedAt()).toBeInstanceOf(Date)
    })

    it('should mark task back to todo and clear completedAt', () => {
      task.markAsCompleted()
      task.markAsTodo()

      expect(task.getStatus().getValue()).toBe(TaskStatusEnum.TODO)
      expect(task.getCompletedAt()).toBeNull()
    })

    it('should update updatedAt on all status transitions', async () => {
      const originalUpdatedAt = task.getUpdatedAt()

      await new Promise(resolve => setTimeout(resolve, 1))
      task.markAsInProgress()
      expect(task.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime())

      const inProgressUpdatedAt = task.getUpdatedAt()
      await new Promise(resolve => setTimeout(resolve, 1))
      task.markAsCompleted()
      expect(task.getUpdatedAt().getTime()).toBeGreaterThan(inProgressUpdatedAt.getTime())

      const completedUpdatedAt = task.getUpdatedAt()
      await new Promise(resolve => setTimeout(resolve, 1))
      task.markAsTodo()
      expect(task.getUpdatedAt().getTime()).toBeGreaterThan(completedUpdatedAt.getTime())
    })
  })

  describe('isOwnedBy', () => {
    it('should return true when userId matches', () => {
      const ownerUserId = new UserId(userId)

      expect(task.isOwnedBy(ownerUserId)).toBe(true)
    })

    it('should return false when userId does not match', () => {
      const differentUserId = new UserId('different-user-123')

      expect(task.isOwnedBy(differentUserId)).toBe(false)
    })
  })
})
