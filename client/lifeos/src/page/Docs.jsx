import React, { useMemo } from 'react'
import './Docs.css'

const quickStartSteps = [
    {
        icon: '1',
        title: 'Create your account',
        text: 'Sign up with a valid email and personalize your dashboard so your experience matches your goals, routines, and energy patterns.',
    },
    {
        icon: '2',
        title: 'Set your focus goals',
        text: 'Add the main outcomes you want to achieve this week or month. Keep them concrete, inspiring, and measurable.',
    },
    {
        icon: '3',
        title: 'Track your progress',
        text: 'Use the dashboard to mark tasks complete, review streaks, and keep a close eye on momentum over time.',
    },
    {
        icon: '4',
        title: 'Use AI guidance',
        text: 'Let the platform suggest realistic next steps, highlight patterns, and help you stay consistent without burnout.',
    },
]

const featureCards = [
    {
        label: 'Dashboard',
        emoji: '📊',
        title: 'See everything in one place',
        description: 'Review your goals, upcoming tasks, performance, and achievements in a visual, focused flow.',
    },
    {
        label: 'Goals',
        emoji: '🎯',
        title: 'Set results that matter',
        description: 'Break large ambitions into actionable steps that are easier to manage and easier to finish.',
    },
    {
        label: 'AI support',
        emoji: '🤖',
        title: 'Get practical feedback',
        description: 'Use personalized insights to decide what to improve, what to stop, and what to prioritize next.',
    },
    {
        label: 'Habits',
        emoji: '🔥',
        title: 'Build momentum daily',
        description: 'Create routines that stay visible, repeatable, and motivating even on busy weeks.',
    },
]

const guides = [
    {
        title: 'How to create a goal',
        content: 'Open the dashboard, choose the goal section, and define a title, target, deadline, and priority. The clearer your goal, the easier it is to track progress.',
    },
    {
        title: 'How to stay consistent',
        content: 'Complete small actions each day, check your streaks, and focus on progress instead of perfection. LifeOS is designed to support sustainable routines.',
    },
    {
        title: 'How to read your insights',
        content: 'Use the analytics and AI recommendations to understand what is working, what needs adjustment, and which tasks deserve more attention.',
    },
    {
        title: 'How to reset when needed',
        content: 'If a week gets harsh, re-prioritize, simplify your plan, and continue. The system is built to support recovery, not guilt.',
    },
]

const faqItems = [
    'Can I use LifeOS without a paid plan? Yes, the platform is designed for a smooth experience for individuals getting started.',
    'Does LifeOS help with habit building? Yes, it helps you organize routines, track completion, and maintain momentum over time.',
    'What if I forget what to do next? The dashboard and AI recommendations keep your next steps visible and actionable.',
    'Can I reset or edit my goals later? Absolutely. You can refine your goals anytime as circumstances and priorities change.',
]

function Docs() {
    const floatingCards = useMemo(
        () => [
            { name: 'Focus Mode', value: '72%', accent: 'cyan' },
            { name: 'Daily Flow', value: '8/10', accent: 'purple' },
            { name: 'Goal Streak', value: '18 days', accent: 'pink' },
        ],
        [],
    )

    return (
        <div className="docs-page">
            <div className="docs-shell">
                <section className="docs-hero">
                    <div className="docs-copy">
                        <span className="docs-badge">LifeOS Guide</span>
                        <h1>How to use LifeOS like a pro.</h1>
                        <p>
                            Welcome to your personalized productivity operating system. This guide helps you get
                            started, stay consistent, and turn your goals into visible outcomes with confidence.
                        </p>
                        <div className="docs-actions">
                            <a href="/register" className="docs-primary-btn">Start now</a>
                            <a href="/dashboard" className="docs-secondary-btn">Open dashboard</a>
                        </div>
                    </div>

                    <div className="docs-visual">
                        <div className="orbit orbit-one" />
                        <div className="orbit orbit-two" />
                        <div className="panel-window">
                            <div className="window-header">
                                <span />
                                <span />
                                <span />
                            </div>
                            <div className="window-body">
                                <div className="mini-chart">
                                    <span className="bar bar-one" />
                                    <span className="bar bar-two" />
                                    <span className="bar bar-three" />
                                    <span className="bar bar-four" />
                                </div>
                                <div className="focus-row">
                                    <p>Weekly focus</p>
                                    <strong>84%</strong>
                                </div>
                            </div>
                        </div>

                        {floatingCards.map((card) => (
                            <div className={`floating-tag ${card.accent}`} key={card.name}>
                                <strong>{card.value}</strong>
                                <span>{card.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="docs-section">
                    <div className="section-heading">
                        <span>Quick start</span>
                        <h2>Start in 4 simple steps.</h2>
                    </div>

                    <div className="steps-grid">
                        {quickStartSteps.map((step) => (
                            <article className="step-card" key={step.title}>
                                <div className="step-number">{step.icon}</div>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="docs-section">
                    <div className="section-heading">
                        <span>Core features</span>
                        <h2>Everything you need to stay in flow.</h2>
                    </div>

                    <div className="feature-grid">
                        {featureCards.map((card) => (
                            <article className="feature-card" key={card.label}>
                                <div className="feature-badge">{card.label}</div>
                                <div className="feature-emoji">{card.emoji}</div>
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="docs-section">
                    <div className="section-heading">
                        <span>Guides</span>
                        <h2>Helpful playbooks for everyday use.</h2>
                    </div>

                    <div className="guide-list">
                        {guides.map((guide) => (
                            <article className="guide-item" key={guide.title}>
                                <div className="guide-icon">✓</div>
                                <div>
                                    <h3>{guide.title}</h3>
                                    <p>{guide.content}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="docs-section faq-section">
                    <div className="section-heading">
                        <span>FAQ</span>
                        <h2>Answers for everyday users.</h2>
                    </div>

                    <div className="faq-list">
                        {faqItems.map((item, index) => (
                            <div className="faq-item" key={index}>
                                <span>Q{index + 1}</span>
                                <p>{item}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="docs-cta">
                    <div className="cta-box">
                        <h2>Ready to build your better routine?</h2>
                        <p>Use LifeOS to plan smarter, act with clarity, and keep your momentum alive every day.</p>
                        <div className="docs-actions">
                            <a href="/register" className="docs-primary-btn">Create account</a>
                            <a href="/contact" className="docs-secondary-btn">Need help?</a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Docs
