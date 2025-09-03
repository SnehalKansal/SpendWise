import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Profile() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone_number: '', date_of_birth: '', gender: '', profile_picture: ''
  })

  useEffect(() => {
    (async () => {
      const data = await fetch(`${API_URL}/profile`).then(r=>r.json())
      setForm(f => ({ ...f, ...data }))
    })()
  }, [])

  const onPickImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm(prev => ({ ...prev, profile_picture: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const save = async (e) => {
    e.preventDefault()
    await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    alert('Profile saved')
  }

  return (
    <div className="container">
      <h1>User Profile</h1>
      <div className="profile-grid">
        <div className="card">
          <h2 className="card-header">Personal Information</h2>
          <form onSubmit={save}>
            <div className="profile-picture-section">
              <img src={form.profile_picture || '/assets/default-avatar.png'} alt="Profile" className="profile-picture-preview" />
              <input type="file" accept="image/*" onChange={onPickImage} />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" value={form.full_name || ''} onChange={e=>setForm({...form, full_name:e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email || ''} onChange={e=>setForm({...form, email:e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input id="phoneNumber" value={form.phone_number || ''} onChange={e=>setForm({...form, phone_number:e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input id="dateOfBirth" type="date" value={form.date_of_birth || ''} onChange={e=>setForm({...form, date_of_birth:e.target.value})} />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" value={form.gender || ''} onChange={e=>setForm({...form, gender:e.target.value})}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer Not to Say</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Save Profile</button>
          </form>
        </div>


      </div>
    </div>
  )
}


