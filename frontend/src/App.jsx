import React, { useState, useEffect } from 'react';
import API from './services/api';
import './App.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (token) {
      fetchJobs();
      fetchUsers();
    }
  }, [token]);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get('/jobs');
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      const { data } = await API.post(endpoint, payload);
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      await API.post('/jobs', { company, role, status, location });
      setCompany('');
      setRole('');
      setLocation('');
      setStatus('Applied');
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding job');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/jobs/${id}`, { status: newStatus });
      fetchJobs();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const deleteJob = async (id) => {
    try {
      await API.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      alert('Error deleting job');
    }
  };

  if (!token) {
    return (
      <div style={{ padding: '40px', maxWidth: '400px', margin: 'auto', fontFamily: 'sans-serif' }}>
        <h2>{isRegister ? 'Register Tracker' : 'Login to Job Tracker'}</h2>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isRegister && (
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" style={{ padding: '10px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <p onClick={() => setIsRegister(!isRegister)} style={{ color: '#2563eb', cursor: 'pointer', marginTop: '15px' }}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </p>
      </div>
    );
  }

  const columns = ['Wishlist', 'Applied', 'Interviewing', 'Offered', 'Rejected'];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>MERN Job Application Tracker</h2>
        <button onClick={() => { localStorage.clear(); setToken(''); }} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
        {/* Left Column: Job Tracker Kanban */}
        <div>
          <form onSubmit={handleAddJob} style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <input type="text" placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} required style={{ padding: '8px', flex: 1 }} />
            <input type="text" placeholder="Job Role" value={role} onChange={(e) => setRole(e.target.value)} required style={{ padding: '8px', flex: 1 }} />
            <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: '8px', flex: 1 }} />
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px' }}>
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
            <button type="submit" style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>Add Job</button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {columns.map(col => (
              <div key={col} style={{ background: '#e2e8f0', padding: '10px', borderRadius: '8px', minHeight: '350px' }}>
                <h4 style={{ borderBottom: '2px solid #cbd5e1', paddingBottom: '6px', textAlign: 'center', fontSize: '14px' }}>{col} ({jobs.filter(j => j.status === col).length})</h4>
                {jobs.filter(j => j.status === col).map(job => (
                  <div key={job._id} style={{ background: '#fff', padding: '10px', borderRadius: '6px', margin: '8px 0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <strong style={{ fontSize: '13px' }}>{job.company}</strong>
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#475569' }}>{job.role}</p>
                    <select value={job.status} onChange={(e) => updateStatus(job._id, e.target.value)} style={{ width: '100%', margin: '6px 0', fontSize: '11px' }}>
                      {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={() => deleteJob(job._id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', width: '100%' }}>Delete</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Registered Members Sidebar */}
        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
          <h3>Registered Members</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px' }}>Total Users: {users.length}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto' }}>
            {users.map(u => (
              <div key={u._id} style={{ padding: '10px', background: '#f1f5f9', borderRadius: '6px' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>{u.name}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>{u.email}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}