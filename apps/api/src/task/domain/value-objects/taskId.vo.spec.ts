import { TaskId } from './taskId.vo'

describe('TaskId', () => {
  it('should generate a unique ID when no ID is provided', () => {
    const taskId1 = new TaskId()
    const taskId2 = new TaskId()

    expect(taskId1.getValue()).toBeDefined()
    expect(taskId2.getValue()).toBeDefined()
    expect(taskId1.getValue()).not.toBe(taskId2.getValue())
  })

  it('should use the provided ID', () => {
    const customId = 'custom-task-id-123'
    const taskId = new TaskId(customId)

    expect(taskId.getValue()).toBe(customId)
  })

  it('should correctly compare two TaskIds with equals', () => {
    const id = 'same-id'
    const taskId1 = new TaskId(id)
    const taskId2 = new TaskId(id)
    const taskId3 = new TaskId('different-id')

    expect(taskId1.equals(taskId2)).toBe(true)
    expect(taskId1.equals(taskId3)).toBe(false)
  })

  it('should generate valid UUID v4 format when no ID is provided', () => {
    const taskId = new TaskId()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    expect(uuidRegex.test(taskId.getValue())).toBe(true)
  })
})
