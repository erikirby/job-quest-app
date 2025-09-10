import React, { useRef } from 'react';
import type { Profile } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface SettingsProps {
  profiles: Profile[];
  activeProfileId: string;
  onProfileChange: (id: string) => void;
  onResetData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ profiles, activeProfileId, onProfileChange, onResetData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
    
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Placeholder for CSV import logic
    alert('CSV import functionality coming soon!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
      onResetData();
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);
    
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800">Settings</h1>
        <p className="mt-2 text-slate-600">Manage your profiles and data.</p>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Switch Profile</h2>
        <div className="flex space-x-4">
          {profiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => onProfileChange(profile.id)}
              className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 transform ${
                activeProfileId === profile.id
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white/50 text-slate-700 hover:bg-white/80'
              }`}
            >
              {profile.name}
            </button>
          ))}
        </div>
      </Card>
      
      {activeProfile && (
          <Card>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Profile Preferences: {activeProfile.name}</h2>
              <div className="space-y-4">
                  <div>
                      <label className="font-semibold text-slate-700">Keywords:</label>
                      <p className="text-slate-600">{activeProfile.preferences.keywords.join(', ')}</p>
                  </div>
                  <div>
                      <label className="font-semibold text-slate-700">Preferred Roles:</label>
                      <p className="text-slate-600">{activeProfile.preferences.preferredRoles.join(', ')}</p>
                  </div>
                   <div>
                      <label className="font-semibold text-slate-700">Remote Only:</label>
                      <p className="text-slate-600">{activeProfile.preferences.remoteOnly ? 'Yes' : 'No'}</p>
                  </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">Note: Profile preferences are currently read-only.</p>
          </Card>
      )}

      <Card>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Data Management</h2>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p>Import jobs from a CSV file.</p>
                <div>
                    <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>Import CSV</Button>
                    <input type="file" ref={fileInputRef} id="csv-import" accept=".csv" className="hidden" onChange={handleImport} />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <p>AI Resume Analysis</p>
                <Button variant="secondary" disabled>Coming Soon!</Button>
            </div>
        </div>
      </Card>

      <Card className="!bg-red-500/20 border-red-500/30">
          <div className="p-0">
            <h2 className="text-xl font-bold text-red-800 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-red-700">Reset All Data</p>
                    <p className="text-sm text-red-600">This will permanently delete all your progress for this profile.</p>
                </div>
                <Button onClick={handleReset} className="!bg-red-600 hover:!bg-red-700 focus:ring-red-500">Reset</Button>
            </div>
          </div>
      </Card>

    </div>
  );
};

export default Settings;
