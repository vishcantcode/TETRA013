import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Loader } from 'lucide-react';
import { useToast } from '../components/Toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'MALE'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shell flex-center" style={{ minHeight: '100vh', padding: '1rem' }}>
      <div className="card animate-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="flex-col flex-center" style={{ marginBottom: '2rem' }}>
          <div style={{ background: 'var(--accent)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
            <HeartPulse size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>HealthSense</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Intelligent Health Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          {!isLogin && (
            <>
              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>First Name</label>
                  <input required name="firstName" className="input" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Last Name</label>
                  <input required name="lastName" className="input" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Date of Birth</label>
                <input required type="date" name="dateOfBirth" className="input" value={formData.dateOfBirth} onChange={handleChange} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Gender</label>
                <select required name="gender" className="select" value={formData.gender} onChange={handleChange}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </>
          )}

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Email</label>
            <input required type="email" name="email" className="input" value={formData.email} onChange={handleChange} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Password</label>
            <input required type="password" name="password" className="input" value={formData.password} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? <Loader className="spinner" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="flex-center" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
