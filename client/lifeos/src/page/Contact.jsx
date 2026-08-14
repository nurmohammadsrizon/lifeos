import React, { useState } from 'react'
import './Contact.css'

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' })
    const [status, setStatus] = useState('')

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            setStatus('Please fill in every field before sending your message.')
            return
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/send-contact-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            const data = await response.json()

            if (data?.status) {
                setStatus('Your message has been sent — we will be in touch soon!')
                setFormData({ name: '', email: '', message: '' })
            } else {
                setStatus(data?.message || 'Unable to send your message at this time.')
            }
        } catch (error) {
            setStatus('Network error: please check your connection and try again.')
        }
    }

    return (
        <div className="contact-page">
            <div className="contact-card">
                <div className="contact-hero">
                    <p>Contact us</p>
                    <h1>Let’s build the life you want.</h1>
                    <p>
                        Share your question, feedback, or a new idea. We’ll reply quickly and help you
                        move forward with clarity.
                    </p>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-field">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="contact-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="contact-field">
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            placeholder="Tell us what you need..."
                            value={formData.message}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="send-button">
                        Send message
                    </button>

                    {status ? <div className="message-status">{status}</div> : null}
                </form>
            </div>
        </div>
    )
}

export default Contact
