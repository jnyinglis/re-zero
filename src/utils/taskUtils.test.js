import { describe, it, expect, beforeEach } from 'vitest'
import {
  createTask,
  splitTask,
  areAllChildrenComplete,
  toggleCollapse,
  getVisibleTasks,
  isParentTask
} from './taskUtils'

describe('Task Splitting Utilities', () => {
  let sampleTask

  beforeEach(() => {
    sampleTask = createTask({
      text: 'Write annual report',
      resistance: 7,
      level: 'project',
      notes: 'Important project notes'
    })
    sampleTask.tags = ['work', 'report']
  })

  describe('splitTask', () => {
    it('should split task in replace mode', () => {
      const newTaskTexts = ['Research data', 'Write draft', 'Review and edit']
      const { parentTask, childTasks } = splitTask(sampleTask, newTaskTexts, { mode: 'replace' })

      expect(childTasks).toHaveLength(3)
      expect(childTasks[0].text).toBe('Research data')
      expect(childTasks[1].text).toBe('Write draft')
      expect(childTasks[2].text).toBe('Review and edit')
      expect(parentTask.status).toBe('replaced')
      expect(parentTask.archivedAt).toBeDefined()
    })

    it('should split task in keep mode', () => {
      const newTaskTexts = ['Task 1', 'Task 2']
      const { parentTask, childTasks } = splitTask(sampleTask, newTaskTexts, { mode: 'keep' })

      expect(childTasks).toHaveLength(2)
      expect(parentTask.childIds).toHaveLength(2)
      expect(parentTask.childIds[0]).toBe(childTasks[0].id)
      expect(parentTask.childIds[1]).toBe(childTasks[1].id)
      expect(parentTask.level).toBe('project')
      expect(parentTask.marked).toBe(false)
      expect(childTasks[0].parentId).toBe(parentTask.id)
      expect(childTasks[1].parentId).toBe(parentTask.id)
    })

    it('should split task in archive mode', () => {
      const newTaskTexts = ['Task 1']
      const { parentTask, childTasks } = splitTask(sampleTask, newTaskTexts, { mode: 'archive' })

      expect(childTasks).toHaveLength(1)
      expect(parentTask.status).toBe('archived')
      expect(parentTask.archivedAt).toBeDefined()
      expect(childTasks[0].parentId).toBeNull()
    })

    it('should inherit metadata from parent task', () => {
      const newTaskTexts = ['Subtask 1']
      const { childTasks } = splitTask(sampleTask, newTaskTexts, { mode: 'replace' })

      expect(childTasks[0].tags).toEqual(['work', 'report'])
      expect(childTasks[0].resistance).toBe(7)
      expect(childTasks[0].level).toBe('step') // project level converts to step
    })

    it('should inherit notes when inheritNotes is true', () => {
      const newTaskTexts = ['Subtask 1']
      const { childTasks } = splitTask(sampleTask, newTaskTexts, {
        mode: 'replace',
        inheritNotes: true
      })

      expect(childTasks[0].notes).toBe('Important project notes')
    })

    it('should not inherit notes when inheritNotes is false', () => {
      const newTaskTexts = ['Subtask 1']
      const { childTasks } = splitTask(sampleTask, newTaskTexts, {
        mode: 'replace',
        inheritNotes: false
      })

      expect(childTasks[0].notes).toBe('')
    })

    it('should filter out empty lines', () => {
      const newTaskTexts = ['Task 1', '', '  ', 'Task 2', '\n']
      const { childTasks } = splitTask(sampleTask, newTaskTexts, { mode: 'replace' })

      expect(childTasks).toHaveLength(2)
      expect(childTasks[0].text).toBe('Task 1')
      expect(childTasks[1].text).toBe('Task 2')
    })

    it('should return empty array when no valid tasks', () => {
      const newTaskTexts = ['', '  ', '\n']
      const { childTasks } = splitTask(sampleTask, newTaskTexts, { mode: 'replace' })

      expect(childTasks).toHaveLength(0)
    })

    it('should trim task text', () => {
      const newTaskTexts = ['  Task with spaces  ']
      const { childTasks } = splitTask(sampleTask, newTaskTexts, { mode: 'replace' })

      expect(childTasks[0].text).toBe('Task with spaces')
    })
  })

  describe('areAllChildrenComplete', () => {
    it('should return true when all children are complete', () => {
      const parentTask = createTask({ text: 'Parent' })
      const child1 = createTask({ text: 'Child 1' })
      const child2 = createTask({ text: 'Child 2' })

      child1.status = 'completed'
      child2.status = 'completed'
      parentTask.childIds = [child1.id, child2.id]

      const tasks = [parentTask, child1, child2]
      const result = areAllChildrenComplete(parentTask.id, tasks)

      expect(result).toBe(true)
    })

    it('should return false when some children are not complete', () => {
      const parentTask = createTask({ text: 'Parent' })
      const child1 = createTask({ text: 'Child 1' })
      const child2 = createTask({ text: 'Child 2' })

      child1.status = 'completed'
      child2.status = 'active'
      parentTask.childIds = [child1.id, child2.id]

      const tasks = [parentTask, child1, child2]
      const result = areAllChildrenComplete(parentTask.id, tasks)

      expect(result).toBe(false)
    })

    it('should return false when task has no children', () => {
      const parentTask = createTask({ text: 'Parent' })
      parentTask.childIds = []

      const tasks = [parentTask]
      const result = areAllChildrenComplete(parentTask.id, tasks)

      expect(result).toBe(false)
    })

    it('should return false when parent does not exist', () => {
      const tasks = []
      const result = areAllChildrenComplete('non-existent-id', tasks)

      expect(result).toBe(false)
    })
  })

  describe('toggleCollapse', () => {
    it('should toggle isCollapsed from false to true', () => {
      const task = createTask({ text: 'Task' })
      task.childIds = ['child1', 'child2']
      task.isCollapsed = false

      const result = toggleCollapse(task)

      expect(result.isCollapsed).toBe(true)
      expect(result.updatedAt).toBeDefined()
    })

    it('should toggle isCollapsed from true to false', () => {
      const task = createTask({ text: 'Task' })
      task.childIds = ['child1']
      task.isCollapsed = true

      const result = toggleCollapse(task)

      expect(result.isCollapsed).toBe(false)
    })

    it('should not toggle if task has no children', () => {
      const task = createTask({ text: 'Task' })
      task.childIds = []
      task.isCollapsed = false

      const result = toggleCollapse(task)

      expect(result).toBe(task)
      expect(result.isCollapsed).toBe(false)
    })
  })

  describe('getVisibleTasks', () => {
    it('should return all tasks when no parents are collapsed', () => {
      const parent = createTask({ text: 'Parent' })
      const child1 = createTask({ text: 'Child 1' })
      const child2 = createTask({ text: 'Child 2' })

      child1.parentId = parent.id
      child2.parentId = parent.id
      parent.childIds = [child1.id, child2.id]
      parent.isCollapsed = false

      const tasks = [parent, child1, child2]
      const result = getVisibleTasks(tasks)

      expect(result).toHaveLength(3)
    })

    it('should hide children when parent is collapsed', () => {
      const parent = createTask({ text: 'Parent' })
      const child1 = createTask({ text: 'Child 1' })
      const child2 = createTask({ text: 'Child 2' })

      child1.parentId = parent.id
      child2.parentId = parent.id
      parent.childIds = [child1.id, child2.id]
      parent.isCollapsed = true

      const tasks = [parent, child1, child2]
      const result = getVisibleTasks(tasks)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(parent.id)
    })

    it('should handle multiple collapsed parents', () => {
      const parent1 = createTask({ text: 'Parent 1' })
      const parent2 = createTask({ text: 'Parent 2' })
      const child1 = createTask({ text: 'Child 1' })
      const child2 = createTask({ text: 'Child 2' })

      child1.parentId = parent1.id
      child2.parentId = parent2.id
      parent1.childIds = [child1.id]
      parent2.childIds = [child2.id]
      parent1.isCollapsed = true
      parent2.isCollapsed = true

      const tasks = [parent1, child1, parent2, child2]
      const result = getVisibleTasks(tasks)

      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toEqual([parent1.id, parent2.id])
    })
  })

  describe('isParentTask', () => {
    it('should return true for task with children', () => {
      const task = createTask({ text: 'Task' })
      task.childIds = ['child1', 'child2']

      expect(isParentTask(task)).toBe(true)
    })

    it('should return false for task without children', () => {
      const task = createTask({ text: 'Task' })
      task.childIds = []

      expect(isParentTask(task)).toBe(false)
    })

    it('should return false for task with undefined childIds', () => {
      const task = createTask({ text: 'Task' })
      delete task.childIds

      expect(isParentTask(task)).toBe(false)
    })
  })

  describe('Integration: Full split workflow', () => {
    it('should handle complete split-keep-complete workflow', () => {
      // 1. Create and split a task in keep mode
      const originalTask = createTask({
        text: 'Build feature',
        resistance: 5,
        level: 'project',
        notes: 'Feature notes'
      })
      originalTask.tags = ['dev', 'sprint-1']

      const { parentTask, childTasks } = splitTask(
        originalTask,
        ['Design UI', 'Implement backend', 'Write tests'],
        { mode: 'keep', inheritNotes: false }
      )

      // 2. Verify parent setup
      expect(parentTask.childIds).toHaveLength(3)
      expect(parentTask.level).toBe('project')
      expect(isParentTask(parentTask)).toBe(true)

      // 3. Verify children setup
      expect(childTasks).toHaveLength(3)
      childTasks.forEach(child => {
        expect(child.parentId).toBe(parentTask.id)
        expect(child.tags).toEqual(['dev', 'sprint-1'])
      })

      // 4. Complete all children
      const allTasks = [parentTask, ...childTasks]
      childTasks.forEach(child => {
        child.status = 'completed'
      })

      // 5. Check if parent can be completed
      expect(areAllChildrenComplete(parentTask.id, allTasks)).toBe(true)

      // 6. Test collapse functionality
      const collapsed = toggleCollapse(parentTask)
      expect(collapsed.isCollapsed).toBe(true)

      const visibleTasks = getVisibleTasks([collapsed, ...childTasks])
      expect(visibleTasks).toHaveLength(1)
      expect(visibleTasks[0].id).toBe(parentTask.id)
    })
  })
})
