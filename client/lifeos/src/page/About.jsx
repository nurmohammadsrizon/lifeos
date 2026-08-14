import React from 'react'
import './About.css'

const impactStats = [
    { value: '10K+', label: 'people building better routines' },
    { value: '95%', label: 'goal completion support rate' },
    { value: '24/7', label: 'AI-guided accountability' },
]

const pillars = [
    {
        icon: '🎯',
        title: 'Goal clarity',
        description: 'Turn vague ambitions into precise, measurable plans that feel achievable from day one.',
    },
    {
        icon: '🧠',
        title: 'Smart guidance',
        description: 'Use AI-powered recommendations and reflections to stay aligned with your real priorities.',
    },
    {
        icon: '📈',
        title: 'Progress tracking',
        description: 'Monitor momentum with structured insights, streaks, and visual performance habits.',
    },
    {
        icon: '🤝',
        title: 'Daily accountability',
        description: 'Build sustainable routines that help you move forward without burning out or losing focus.',
    },
]

const milestones = [
    {
        year: '2023',
        title: 'The idea took shape',
        text: 'LifeOS began as a personal mission to organize goals, tasks, and well-being in one calm system.',
    },
    {
        year: '2024',
        title: 'AI insights entered the flow',
        text: 'We blended productivity systems with intelligent recommendations that adapt to user behavior.',
    },
    {
        year: '2025',
        title: 'A complete life dashboard',
        text: 'We expanded into a full operating system for focus, planning, growth, and self-improvement.',
    },
]

const team = [
    { name: 'Nur Mohammad Srizon', role: 'Main Creator', bio: 'Designs the emotional and strategic direction behind every feature.', accent: 'SM' },
    { name: 'MD Nahid', role: 'Manager Of LifeOS', bio: 'Builds the core system that keeps LifeOS fast, reliable, and scalable.', accent: 'RA' },
    { name: 'Blazeness', role: 'Experience Designer', bio: 'Shapes the user journeys, dashboards, and interactions that make progress feel rewarding.', accent: 'NS' },
]

const values = [
    'We believe personal growth should feel simple, motivating, and sustainable.',
    'We make software that turns intention into action without overwhelm.',
    'We design every feature around clarity, momentum, and long-term wellness.',
]

function About() {
    return (
        <div className="about-page">
            <div className="about-shell">
                <section className="about-hero">
                    <div className="about-copy">
                        <span className="about-badge">About LifeOS</span>
                        <h1>A smarter way to build the life you want.</h1>
                        <p>
                            LifeOS is a modern life operating system created to help people organize goals,
                            manage time, and stay consistent with what matters most. We combine AI guidance,
                            clarity, and thoughtful design so every day feels more purposeful.
                        </p>
                        <div className="about-actions">
                            <a href="/learn-more" className="about-primary-btn">Explore features</a>
                            <a href="/contact" className="about-secondary-btn">Talk to us</a>
                        </div>
                    </div>

                    <div className="about-spotlight">
                        <div className="spotlight-card main-card">
                            <span className="mini-tag">Mission</span>
                            <h3>Turn intention into momentum</h3>
                            <p>
                                We help people move from inspiration to execution with tools designed for focus,
                                growth, and real-life productivity.
                            </p>
                        </div>
                        <div className="spotlight-card floating-card">
                            <div className="metric-line">
                                <strong>12.4k</strong>
                                <span>focus sessions</span>
                            </div>
                            <div className="metric-line">
                                <strong>4.9/5</strong>
                                <span>user satisfaction</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="about-stats">
                    {impactStats.map((stat) => (
                        <div className="stat-box" key={stat.label}>
                            <span>{stat.value}</span>
                            <p>{stat.label}</p>
                        </div>
                    ))}
                </section>

                <section className="about-section" id="mission">
                    <div className="section-heading">
                        <span>Why we built this</span>
                        <h2>Life planning should feel focused, not overwhelming.</h2>
                    </div>

                    <div className="pillars-grid">
                        {pillars.map((pillar) => (
                            <article className="pillar-card" key={pillar.title}>
                                <div className="pillar-icon">{pillar.icon}</div>
                                <h3>{pillar.title}</h3>
                                <p>{pillar.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="about-section story-section">
                    <div className="section-heading">
                        <span>Our story</span>
                        <h2>Built from real habits, goals, and growth cycles.</h2>
                    </div>

                    <div className="timeline">
                        {milestones.map((item) => (
                            <div className="timeline-item" key={item.year}>
                                <div className="timeline-year">{item.year}</div>
                                <div className="timeline-content">
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="about-section team-section">
                    <div className="section-heading">
                        <span>Meet the team</span>
                        <h2>The people behind LifeOS.</h2>
                    </div>

                    <div className="team-grid">
                        {team.map((member) => (
                            <article className="team-card" key={member.name}>
                                <div className="avatar">{member.accent}</div>
                                <h3>{member.name}</h3>
                                <span>{member.role}</span>
                                <p>{member.bio}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="about-section values-section">
                    <div className="values-panel">
                        <div>
                            <span className="about-badge">Our values</span>
                            <h2>We design for momentum, not chaos.</h2>
                        </div>
                        <ul>
                            {values.map((value) => (
                                <li key={value}>{value}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="about-cta">
                    <div className="cta-box">
                        <h2>Ready to build a more intentional life?</h2>
                        <p>
                            Join LifeOS and turn your goals into progress you can feel every single day.
                        </p>
                        <div className="about-actions">
                            <a href="/register" className="about-primary-btn">Get started</a>
                            <a href="/contact" className="about-secondary-btn">Contact us</a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default About
