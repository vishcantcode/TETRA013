import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { User, Save } from 'lucide-react';
import { api } from '../api';

const Profile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.profile.update(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-col gap-4 animate-in">
      <header className="flex-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information</p>
        </div>
      </header>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-header flex-between">
          <h2 className="card-title flex align-center gap-2"><User size={20} /> Personal Details</h2>
          {!isEditing && (
            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </div>
        
        <div className="card-body flex-col gap-4">
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <div className="input-group">
              <label>First Name</label>
              <input 
                name="firstName"
                className="input" 
                value={formData.firstName} 
                onChange={handleChange}
                disabled={!isEditing} 
              />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input 
                name="lastName"
                className="input" 
                value={formData.lastName} 
                onChange={handleChange}
                disabled={!isEditing} 
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Email Address</label>
            <input 
              name="email"
              type="email"
              className="input" 
              value={formData.email} 
              onChange={handleChange}
              disabled={!isEditing} 
            />
          </div>

          {isEditing && (
            <div className="flex gap-2" style={{ marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
