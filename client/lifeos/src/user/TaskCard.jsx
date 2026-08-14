import { useEffect, useMemo, useState } from 'react'

function formatProgress(task) {
    const rawValue = task.current_value ?? task.value ?? task.progress ?? (task.completed ? 1 : 0)
    const numericValue = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue
    const normalizedValue = Number.isFinite(numericValue) ? numericValue : 0
    const target = Number.isFinite(Number(task.target)) ? Number(task.target) : undefined

    let progress = 0
    if (task.type === 'boolean') {
        progress = task.completed ? 100 : 0
    } else if (task.type === 'percentage' || task.type === 'progress') {
        progress = Math.min(100, Math.max(0, normalizedValue))
    } else if (target && target > 0) {
        progress = Math.min(100, Math.max(0, Math.round((normalizedValue / target) * 100)))
    } else {
        progress = Math.min(100, Math.max(0, normalizedValue))
    }

    return {
        currentValue: normalizedValue,
        target: target ?? (task.type === 'percentage' || task.type === 'progress' ? 100 : 1),
        progress,
    }
}

const TaskCard = ({ task, onSave, saving }) => {
    const [inputValue, setInputValue] = useState(() => {
        const defaultValue = task.current_value ?? task.value ?? task.progress ?? (task.completed ? 100 : '')
        return defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : ''
    })

    const { currentValue, target, progress } = useMemo(() => formatProgress(task), [task])

    useEffect(() => {
        setInputValue(() => {
            const defaultValue = task.current_value ?? task.value ?? task.progress ?? (task.completed ? 100 : '')
            return defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : ''
        })
    }, [task.current_value, task.value, task.progress, task.completed])

    const isBoolean = task.type === 'boolean'
    const isPercentage = task.type === 'percentage'
    const isStreak = task.type === 'streak'

    const statusLabel = task.completed
        ? 'Completed'
        : progress >= 100
            ? 'Achieved'
            : 'In progress'

    const handleSave = () => {
        const updatePayload = { id: task.id }

        if (isBoolean) {
            const nextCompleted = !Boolean(task.completed)
            updatePayload.completed = nextCompleted
            updatePayload.current_value = nextCompleted ? 1 : 0
            updatePayload.progress = nextCompleted ? 100 : 0
        } else if (
            task.type === 'count' ||
            task.type === 'hours' ||
            task.type === 'number' ||
            task.type === 'percentage' ||
            task.type === 'progress' ||
            isStreak
        ) {
            const value = parseFloat(inputValue)
            if (!Number.isFinite(value)) {
                return
            }
            updatePayload.current_value = value
            if (isPercentage || task.type === 'progress') {
                updatePayload.progress = Math.min(100, Math.max(0, value))
            } else if (target > 0) {
                updatePayload.progress = Math.min(100, Math.max(0, Math.round((value / target) * 100)))
                if (updatePayload.progress >= 100) {
                    updatePayload.completed = true
                }
            }
        } else {
            updatePayload.current_value = inputValue
        }

        onSave(updatePayload)
    }

    return (
        <article className="task-card">
            <div className="task-card-header">
                <div>
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                </div>
                <span className={`task-pill ${task.completed ? 'task-completed' : 'task-active'}`}>
                    {statusLabel}
                </span>
            </div>

            <div className="task-progress-bar">
                <div className="task-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="task-progress-meta">
                <span>{Math.round(progress)}%</span>
                <span>
                    {currentValue} / {target} {task.unit ?? ''}
                </span>
            </div>

            <div className="task-actions">
                {isBoolean ? (
                    <button
                        type="button"
                        className="task-toggle-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {task.completed ? 'Mark not done' : 'Mark complete'}
                    </button>
                ) : (
                    <>
                        <input
                            className="task-input"
                            type={isPercentage ? 'number' : 'text'}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isBoolean ? 'Complete' : String(currentValue)}
                        />
                        <button type="button" className="task-save-btn" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Update'}
                        </button>
                    </>
                )}
            </div>
        </article>
    )
}

export default TaskCard
