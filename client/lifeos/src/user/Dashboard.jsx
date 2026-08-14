import React, { useEffect, useMemo, useState } from 'react'
import './Dashboard.css'
import TaskCard from './TaskCard'

const Dashboard = () => {
  const [goal, setGoal] = useState("")
  const [goal_time, setTime] = useState("")
  const [goalDesc, setGoalDesc] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [goalStatus, setGoalStatus] = useState(null)
  const [taskSchema, setTaskSchema] = useState([])
  const [toast, setToast] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [savingTask, setSavingTask] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const userId = typeof window !== 'undefined'
    ? localStorage.getItem('user_id') || localStorage.getItem('user_name') || 'guest'
    : 'guest'
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('email') || undefined : undefined

  function showToast(message, type = 'info') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4500)
  }

  function computeTaskProgress(task) {
    const rawValue = task.current_value ?? task.value ?? task.progress ?? (task.completed ? 1 : 0)
    const numericValue = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue
    const normalizedValue = Number.isFinite(numericValue) ? numericValue : 0
    const target = Number.isFinite(Number(task.target)) ? Number(task.target) : undefined

    if (task.type === 'boolean') {
      return task.completed ? 100 : 0
    }
    if (task.type === 'percentage' || task.type === 'progress') {
      return Math.min(100, Math.max(0, normalizedValue))
    }
    if (target && target > 0) {
      return Math.min(100, Math.max(0, Math.round((normalizedValue / target) * 100)))
    }
    return Math.min(100, Math.max(0, normalizedValue))
  }

  const dashboardSummary = useMemo(() => {
    const totalTasks = taskSchema.length
    const progressValues = taskSchema.map(computeTaskProgress)
    const averageProgress = totalTasks
      ? Math.round(progressValues.reduce((sum, item) => sum + item, 0) / totalTasks)
      : 0

    return {
      totalTasks,
      completed: taskSchema.filter((item) => item.completed || computeTaskProgress(item) >= 100).length,
      progress: Math.min(100, averageProgress),
    }
  }, [taskSchema])

  async function loadGoalStatus() {
    if (!userId) {
      setLoadingStatus(false)
      setGoalStatus({ exists: false, expired: false, status: 'none', main_goal: {} })
      return
    }

    try {
      const [statusResponse, statsResponse] = await Promise.all([
        fetch(`http://127.0.0.1:8000/goal_status/${encodeURIComponent(userId)}`),
        fetch(`http://127.0.0.1:8000/dashboard_stats/${encodeURIComponent(userId)}`),
      ])

      const statusData = statusResponse.ok ? await statusResponse.json() : { exists: false, expired: false, status: 'none', main_goal: {} }
      const statsData = statsResponse.ok ? await statsResponse.json() : {}

      setGoalStatus(statusData)
      setTaskSchema(Array.isArray(statsData.schema) ? statsData.schema : [])

      if (!statusResponse.ok || !statsResponse.ok) {
        showToast('Some dashboard data failed to load.', 'warning')
      }
    } catch (error) {
      console.error('Failed to load dashboard data', error)
      showToast('Unable to load dashboard data.', 'error')
      setGoalStatus({ exists: false, expired: false, status: 'none', main_goal: {} })
      setTaskSchema([])
    } finally {
      setLoadingStatus(false)
    }
  }

  useEffect(() => {
    loadGoalStatus()
  }, [userId])

  async function handleAnalyzeAllData() {
    if (!userId) {
      showToast('Login again to analyze your progress.', 'warning')
      return
    }

    setAnalyzing(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/get_analization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: userId }),
      })

      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.detail || data?.message || 'Unable to analyze data.')
      }

      setAnalysis(data.analysis || null)
      showToast('AI analysis updated.', 'success')
    } catch (error) {
      console.error('Analyze user progress', error)
      showToast(error.message || 'Failed to analyze your user data.', 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  async function FetchingBackendData(event) {
    event.preventDefault()

    try {
      const response = await fetch('http://127.0.0.1:8000/goal_fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userId,
          email: userEmail,
          goal,
          goal_desc: goalDesc,
          goal_time,
        }),
      })

      const data = await response.json()
      if (data.status) {
        localStorage.setItem('goal_saved', 'true')
        setStatusMessage('Goal saved successfully.')
        showToast('Goal saved successfully.', 'success')
        setGoal('')
        setGoalDesc('')
        setTime('')
        await loadGoalStatus()
      } else {
        localStorage.setItem('goal_saved', 'false')
        const message = data.message || 'An error occurred'
        setStatusMessage(message)
        showToast(message, 'error')
      }
    } catch (error) {
      const message = 'Unable to reach the server.'
      setStatusMessage(message)
      showToast(message, 'error')
    }
  }

  const updateTask = async (updatePayload) => {
    if (!userId) return
    setSavingTask(true)

    try {
      const response = await fetch(`http://127.0.0.1:8000/dashboard_stats/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates: [updatePayload] }),
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      if (data.schema && Array.isArray(data.schema)) {
        setTaskSchema(data.schema)
        showToast('Task progress updated.', 'success')
      } else {
        showToast('Unable to update task progress.', 'error')
      }
    } catch (error) {
      console.error('Save task update', error)
      showToast('Failed to save progress.', 'error')
    } finally {
      setSavingTask(false)
    }
  }

  const progressItems = [
    { label: 'Personal Growth', value: 82 },
    { label: 'Work Momentum', value: 74 },
    { label: 'Learning Focus', value: 91 },
  ]

  const timeline = [
    'Morning reflection and priorities set for the day.',
    'Deep work block completed with strong focus.',
    'Evening review highlights the next growth milestone.',
  ]

  const suggestions = [
    { icon: '✨', title: 'AI coaching', text: 'Try a 20-minute sprint to sharpen your top skill.' },
    { icon: '📈', title: 'Data pulse', text: 'Your consistency trend is outperforming last month.' },
    { icon: '🧠', title: 'Mindset boost', text: 'A short reset can turn a tough task into a win.' },
  ]

  return (
    <div className="dashboard-page">
      {toast ? (
        <div className={`dashboard-toast ${toast.type}`}>
          {toast.message}
        </div>
      ) : null}

      <div className="dashboard-shell">
        <section className="dashboard-hero">
          <div className="hero-card">
            <div className="hero-content">
              <span className="hero-kicker">LifeOS dashboard</span>
              <h2 className="hero-title">Your momentum is building.</h2>
              <p className="hero-copy">
                Review goals, update tasks, and keep your next wins visible in one simple workspace.
              </p>
              <div className="hero-actions">
                <button className="hero-btn" type="button" onClick={handleAnalyzeAllData} disabled={analyzing}>
                  {analyzing ? 'Analyzing…' : 'Analyze all data'}
                </button>
                <button className="ghost-btn" type="button">Plan next week</button>
              </div>
            </div>

            <div className="dashboard-summary-card">
              <div>
                <span className="info-label">Current focus</span>
                <h3 className="summary-title">{goalStatus?.main_goal?.goal ?? 'No goal set yet'}</h3>
                <p>{goalStatus?.main_goal?.goal_desc ?? 'Start by saving a goal to populate your dashboard.'}</p>
              </div>
              <div className="goal-summary-status">
                <span>{goalStatus?.exists ? goalStatus.status : 'waiting'}</span>
                {goalStatus?.main_goal?.expires_at ? (
                  <small>Expires {new Date(goalStatus.main_goal.expires_at).toLocaleDateString()}</small>
                ) : null}
              </div>
            </div>
          </div>

          <div className="info-card dashboard-metrics-card">
            <span className="info-label">This week</span>
            <div className="metric-grid compact-metrics">
              <div className="metric-card">
                <strong>{dashboardSummary.completed}</strong>
                <span>Done</span>
              </div>
              <div className="metric-card">
                <strong>{dashboardSummary.totalTasks}</strong>
                <span>Cards</span>
              </div>
              <div className="metric-card">
                <strong>{dashboardSummary.progress}%</strong>
                <span>Progress</span>
              </div>
            </div>
          </div>
        </section>

        {(goalStatus?.expired || !goalStatus?.exists) ? (
          <section className="goal-setup-card section-card compact-card">
            <div className="section-title-row">
              <h3 className="section-title">Set your first goal</h3>
              <span className="muted">Start tracking your progress</span>
            </div>
            <form className="GoalInput" onSubmit={FetchingBackendData}>
              <div className="goalInput">
                <input
                  type="text"
                  name="goal_Input"
                  className="goal_placeholder_indentify"
                  id="goal_input"
                  placeholder="Enter your goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>
              <div className="goal">
                <input
                  type="text"
                  name="goal_desc"
                  id="goal_desc"
                  className="goal_placeholder_indentify"
                  placeholder="Goal description here"
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                />
              </div>
              <div className="goalTime">
                <input
                  type="text"
                  name="time_input"
                  className="goal_placeholder_indentify"
                  id="time_input"
                  placeholder="Enter time here"
                  value={goal_time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <button type="submit">Save goal</button>
              {statusMessage ? <p className="muted">{statusMessage}</p> : null}
              {goalStatus?.expired ? (
                <p className="muted alert warning">
                  Your previous goal expired{goalStatus.main_goal?.expires_at ? ` on ${new Date(goalStatus.main_goal.expires_at).toLocaleDateString()}` : ''}.
                  Please enter a new one.
                </p>
              ) : null}
            </form>
          </section>
        ) : null}

        <section className="dashboard-main-grid">
          <div className="section-card">
            <div className="section-title-row">
              <h3 className="section-title">Task cards</h3>
              <span className="muted">Track every step</span>
            </div>
            <div className="progress-stack">
              {loadingStatus ? (
                <div className="loading-message">Loading progress tasks…</div>
              ) : taskSchema.length ? (
                taskSchema.map((task) => (
                  <TaskCard key={task.id} task={task} onSave={updateTask} saving={savingTask} />
                ))
              ) : (
                <div className="empty-state-card">
                  No progress tasks found. Save a goal to generate task progress cards.
                </div>
              )}
            </div>
          </div>

          <div className="section-card ai-card">
            <div className="section-title-row">
              <h3 className="section-title">AI guidance</h3>
              <span className="ai-pill">smart insight</span>
            </div>

            <div className="ai-analysis-panel">
              <button
                type="button"
                className="ai-analyze-btn"
                onClick={handleAnalyzeAllData}
                disabled={analyzing}
              >
                <span className="ai-btn-glow" />
                {analyzing ? 'Analyzing your progress…' : 'Analyze all user data'}
              </button>

              {analysis ? (
                <div className="analysis-card">
                  <div className="analysis-card-header">
                    <span className="analysis-label">AI pulse</span>
                    <strong>{analysis.score}/100</strong>
                  </div>
                  <h4>{analysis.headline}</h4>
                  <p>{analysis.summary}</p>

                  <div className="analysis-metrics">
                    <div>
                      <span>Progress</span>
                      <strong>{analysis.progress}%</strong>
                    </div>
                    <div>
                      <span>Tasks</span>
                      <strong>{analysis.task_count}</strong>
                    </div>
                    <div>
                      <span>Done</span>
                      <strong>{analysis.completed_tasks}</strong>
                    </div>
                  </div>

                  <div className="analysis-columns">
                    <div>
                      <h5>Strengths</h5>
                      <ul>
                        {(analysis.strengths || []).map((item, index) => <li key={`strength-${index}`}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5>Focus areas</h5>
                      <ul>
                        {(analysis.weaknesses || []).map((item, index) => <li key={`weakness-${index}`}>{item}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="analysis-recommendations">
                    <h5>Recommendations</h5>
                    <ul>
                      {(analysis.recommendations || []).map((item, index) => <li key={`recommendation-${index}`}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="analysis-empty">
                  Click the button to generate a full analysis of your tracked goal, task progress, and momentum.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="dashboard-main-grid lower-grid">
          <div className="section-card">
            <div className="section-title-row">
              <h3 className="section-title">Current goal</h3>
              <span className="muted">Goal insights</span>
            </div>
            <div className="goal-summary">
              {goalStatus && goalStatus.exists ? (
                <>
                  <p><strong>Goal:</strong> {goalStatus.main_goal.goal}</p>
                  <p><strong>Description:</strong> {goalStatus.main_goal.goal_desc}</p>
                  <p><strong>Target:</strong> {goalStatus.main_goal.goal_time}</p>
                </>
              ) : (
                <p className="muted">No active goal yet. Add one to start tracking progress.</p>
              )}
            </div>
          </div>

          <div className="section-card">
            <div className="section-title-row">
              <h3 className="section-title">Support</h3>
              <span className="muted">Need a boost?</span>
            </div>
            <div className="suggestion-list">
              <div className="suggestion-item">
                <div className="suggestion-icon">✨</div>
                <div>
                  <strong>Stay consistent</strong>
                  <div className="muted">Update your progress daily to keep the momentum building.</div>
                </div>
              </div>
              <div className="suggestion-item">
                <div className="suggestion-icon">⚡</div>
                <div>
                  <strong>Review goals</strong>
                  <div className="muted">Focus on the highest-impact tasks first for faster wins.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
