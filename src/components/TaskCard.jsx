import { isParentTask, areAllChildrenComplete } from '../utils/taskUtils'

export default function TaskCard({
  task,
  tasks = [],
  children,
  onToggleCollapse,
  onCompleteParent,
  className = '',
  showParentIndicators = true
}) {
  const isParent = isParentTask(task)
  const isChild = !!task.parentId
  const allChildrenComplete = isParent && areAllChildrenComplete(task.id, tasks)

  // Calculate completed children count
  let completedCount = 0
  let totalCount = 0
  if (isParent && task.childIds) {
    const children = tasks.filter(t => task.childIds.includes(t.id))
    totalCount = children.length
    completedCount = children.filter(c => c.status === 'completed').length
  }

  const cardClasses = [
    'task-card',
    isParent && showParentIndicators ? 'task-is-parent' : '',
    isChild && showParentIndicators ? 'task-is-child' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <article className={cardClasses}>
      {/* Parent completion prompt */}
      {allChildrenComplete && onCompleteParent && (
        <div className="parent-completion-prompt">
          <span className="parent-completion-prompt-text">
            All subtasks complete! Complete parent task?
          </span>
          <button onClick={() => onCompleteParent(task.id)}>
            Complete
          </button>
        </div>
      )}

      {/* Task content */}
      <header style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
        {isParent && onToggleCollapse && showParentIndicators && (
          <button
            className={`collapse-toggle ${task.isCollapsed ? 'collapsed' : ''}`}
            onClick={() => onToggleCollapse(task.id)}
            aria-label={task.isCollapsed ? 'Expand' : 'Collapse'}
            title={task.isCollapsed ? 'Expand subtasks' : 'Collapse subtasks'}
          >
            ▼
          </button>
        )}
        <div style={{ flex: 1 }}>
          {children}
        </div>
        {isParent && showParentIndicators && (
          <span className="parent-task-progress" title={`${completedCount} of ${totalCount} complete`}>
            {completedCount}/{totalCount}
          </span>
        )}
      </header>
    </article>
  )
}
