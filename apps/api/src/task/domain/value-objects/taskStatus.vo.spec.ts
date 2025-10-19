import { TaskStatus, TaskStatusEnum } from './taskStatus.vo'

describe('TaskStatus', () => {
  it('should default to TODO when no status is provided', () => {
    const status = new TaskStatus()

    expect(status.getValue()).toBe(TaskStatusEnum.TODO)
    expect(status.isTodo()).toBe(true)
    expect(status.isInProgress()).toBe(false)
    expect(status.isCompleted()).toBe(false)
  })

  it('should set status to IN_PROGRESS', () => {
    const status = new TaskStatus(TaskStatusEnum.IN_PROGRESS)

    expect(status.getValue()).toBe(TaskStatusEnum.IN_PROGRESS)
    expect(status.isTodo()).toBe(false)
    expect(status.isInProgress()).toBe(true)
    expect(status.isCompleted()).toBe(false)
  })

  it('should set status to COMPLETED', () => {
    const status = new TaskStatus(TaskStatusEnum.COMPLETED)

    expect(status.getValue()).toBe(TaskStatusEnum.COMPLETED)
    expect(status.isTodo()).toBe(false)
    expect(status.isInProgress()).toBe(false)
    expect(status.isCompleted()).toBe(true)
  })

  it('should correctly compare two TaskStatus objects with equals', () => {
    const status1 = new TaskStatus(TaskStatusEnum.TODO)
    const status2 = new TaskStatus(TaskStatusEnum.TODO)
    const status3 = new TaskStatus(TaskStatusEnum.COMPLETED)

    expect(status1.equals(status2)).toBe(true)
    expect(status1.equals(status3)).toBe(false)
  })
})
