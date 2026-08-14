import { useEffect, useMemo, useState } from 'react'
import './Profile.css'

const defaultProfile = {
  fullname: '',
  username: '',
  email: '',
  password: '',
  bio: '',
  phone: '',
  location: '',
  website: '',
  profile_picture: '',
}

const getStoredIdentifier = () => {
  if (typeof window === 'undefined') return 'guest'
  return localStorage.getItem('user_id') || localStorage.getItem('email') || localStorage.getItem('user_name') || 'guest'
}

function Profile() {
  const [profile, setProfile] = useState(defaultProfile)
  const [formData, setFormData] = useState(defaultProfile)
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [previewImage, setPreviewImage] = useState('')
  const backendBase = 'http://127.0.0.1:8000'

  const identifier = useMemo(() => getStoredIdentifier(), [])

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        const response = await fetch(`http://127.0.0.1:8000/profile/${encodeURIComponent(identifier)}`)
        const data = await response.json()

        if (data?.status && data?.profile) {
          const nextProfile = {
            fullname: data.profile.fullname || '',
            username: data.profile.username || '',
            email: data.profile.email || '',
            password: '',
            bio: data.profile.bio || '',
            phone: data.profile.phone || '',
            location: data.profile.location || '',
            website: data.profile.website || '',
            profile_picture: data.profile.profile_picture || '',
          }

          setProfile(nextProfile)
          setFormData(nextProfile)
          setPreviewImage(nextProfile.profile_picture || '')
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Unable to load your profile right now.' })
      } finally {
        setLoading(false)
      }
    }

    if (identifier) {
      loadProfile()
    }
  }, [identifier])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === 'profile_picture') {
      setSelectedFile(null)
      setPreviewImage(value)
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewImage(URL.createObjectURL(file))
    setFormData((prev) => ({ ...prev, profile_picture: '' }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      let profilePictureUrl = formData.profile_picture

      if (selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('identifier', identifier)
        uploadFormData.append('file', selectedFile)

        const uploadResponse = await fetch(`${backendBase}/profile/upload-picture`, {
          method: 'POST',
          body: uploadFormData,
        })
        const uploadResult = await uploadResponse.json()

        if (!uploadResponse.ok || !uploadResult?.success) {
          throw new Error(uploadResult?.detail || uploadResult?.message || 'Profile picture upload failed.')
        }

        profilePictureUrl = uploadResult.file_url || uploadResult.profile_picture
      }

      const payload = {
        identifier,
        fullname: formData.fullname,
        username: formData.username,
        email: formData.email,
        password: formData.password || undefined,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        profile_picture: profilePictureUrl,
      }

      const response = await fetch(`${backendBase}/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data?.status) {
        throw new Error(data?.detail || data?.message || 'Profile update failed')
      }

      const nextProfile = {
        fullname: data.profile.fullname || '',
        username: data.profile.username || '',
        email: data.profile.email || '',
        password: '',
        bio: data.profile.bio || '',
        phone: data.profile.phone || '',
        location: data.profile.location || '',
        website: data.profile.website || '',
        profile_picture: data.profile.profile_picture || '',
      }

      setProfile(nextProfile)
      setFormData(nextProfile)
      setPreviewImage(nextProfile.profile_picture || '')
      setSelectedFile(null)
      localStorage.setItem('email', nextProfile.email)
      localStorage.setItem('user_name', nextProfile.username)
      localStorage.setItem('user_id', nextProfile.email || identifier)

      setMessage({ type: 'success', text: 'Profile updated successfully.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to save profile changes.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading your profile...</div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <section className="profile-hero">
          <div className="profile-card hero-panel">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" />
                ) : (
                  <span>{(profile.fullname || profile.username || 'L').charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            <div className="profile-summary">
              <span className="profile-pill">Profile overview</span>
              <h1>{profile.fullname || 'Your Name'}</h1>
              <p>{profile.bio || 'Add a short bio to describe your goals and vision.'}</p>
              <div className="summary-meta">
                <span>{profile.location || 'Location not set'}</span>
                <span>{profile.email || 'Email not set'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-grid">
              <div className="photo-panel">
                <div className="panel-heading">
                  <h3>Profile picture</h3>
                </div>
                <div className="upload-box">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile preview" />
                  ) : (
                    <div className="upload-placeholder">Upload</div>
                  )}
                </div>
                <label className="upload-button">
                  Choose image
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
                <div className="form-field">
                  <label>Profile image URL</label>
                  <input
                    type="url"
                    name="profile_picture"
                    placeholder="https://example.com/avatar.png"
                    value={formData.profile_picture}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="details-panel">
                <div className="panel-heading">
                  <h3>Personal details</h3>
                </div>

                <div className="field-row two-col">
                  <div className="form-field">
                    <label>Full name</label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="field-row two-col">
                  <div className="form-field">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="field-row two-col">
                  <div className="form-field">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Short bio</label>
                  <textarea
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="security-panel">
              <div className="panel-heading">
                <h3>Security</h3>
              </div>

              <div className="form-field">
                <label>New password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {message.text ? (
              <div className={`status-box ${message.type === 'success' ? 'success' : 'error'}`}>
                {message.text}
              </div>
            ) : null}

            <div className="form-actions">
              <button className="save-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export default Profile
