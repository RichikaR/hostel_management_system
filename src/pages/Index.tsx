import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setRole, setBlock, setRoom, setStudentName, setWorkerCategory, ALL_CATEGORIES } from '@/lib/storage';

const Index = () => {
  const navigate = useNavigate();
  const [role, setRoleState] = useState('');
  const [step, setStep] = useState(1);
  const [block, setBlockState] = useState('');
  const [room, setRoomState] = useState('');
  const [name, setNameState] = useState('');
  const [workerCat, setWorkerCat] = useState('');

  const handleRoleSelect = () => {
    if (!role) return;
    setRole(role);
    if (role === 'Student') setStep(2);
    else if (role === 'Worker') setStep(3);
    else navigate('/warden');
  };

  const handleStudentNext = () => {
    if (!block || !room || !name) return;
    setBlock(block);
    setRoom(room);
    setStudentName(name);
    navigate('/student');
  };

  const handleWorkerNext = () => {
    if (!workerCat) return;
    setWorkerCategory(workerCat);
    navigate('/worker');
  };

  const roleInfo: Record<string, { icon: string; desc: string }> = {
    Student: { icon: '🎓', desc: 'Raise complaints, manage inventory, request visitors' },
    Warden: { icon: '🛡️', desc: 'Oversee hostel operations, approve requests' },
    Worker: { icon: '🔧', desc: 'Handle assigned complaints and cleaning tasks' },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="header-bar py-6 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ opacity: 0.7 }}>
            College Hostel Administration
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'white' }}>Hostel Management System</h1>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center pt-10 px-4">
        <div className="w-full max-w-md">

          {step === 1 && (
            <div className="page-card">
              <h2 className="section-title text-center">Select Your Role</h2>
              <p className="text-sm text-muted-foreground mb-5 text-center">Choose your role to access the appropriate dashboard.</p>
              <div className="flex flex-col gap-3 mb-5">
                {(['Student', 'Warden', 'Worker'] as const).map(r => (
                  <label
                    key={r}
                    className="flex items-center gap-4 p-4 rounded-md cursor-pointer transition-all"
                    style={{
                      border: role === r ? '2px solid hsl(220, 65%, 32%)' : '2px solid hsl(220, 20%, 88%)',
                      background: role === r ? 'hsl(220, 60%, 96%)' : 'white',
                    }}
                  >
                    <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRoleState(r)} className="sr-only" />
                    <span className="text-2xl">{roleInfo[r].icon}</span>
                    <div className="flex-1">
                      <span className="font-semibold text-sm block">{r}</span>
                      <span className="text-xs text-muted-foreground">{roleInfo[r].desc}</span>
                    </div>
                    <span
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: role === r ? 'hsl(220, 65%, 32%)' : 'hsl(220, 20%, 80%)',
                        background: role === r ? 'hsl(220, 65%, 32%)' : 'white',
                      }}
                    >
                      {role === r && <span className="w-2 h-2 rounded-full bg-white block" />}
                    </span>
                  </label>
                ))}
              </div>
              <button className="btn-primary w-full" onClick={handleRoleSelect} disabled={!role}>
                Continue →
              </button>
              <div className="mt-4 text-center">
                <button onClick={() => navigate('/info')} className="text-sm font-medium underline cursor-pointer bg-transparent border-none" style={{ color: 'hsl(220, 65%, 38%)' }}>
                  View System Features & Info
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="page-card">
              <h2 className="section-title">Student Details</h2>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" value={name} onChange={e => setNameState(e.target.value)} placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label>Select Block</label>
                <div className="grid grid-cols-2 gap-3">
                  {['B', 'C'].map(b => (
                    <label
                      key={b}
                      className="flex items-center justify-center gap-2 p-4 rounded-md cursor-pointer font-semibold text-center transition-all"
                      style={{
                        border: block === b ? '2px solid hsl(220, 65%, 32%)' : '2px solid hsl(220, 20%, 88%)',
                        background: block === b ? 'hsl(220, 60%, 96%)' : 'white',
                        color: block === b ? 'hsl(220, 65%, 32%)' : 'inherit',
                      }}
                    >
                      <input type="radio" name="block" value={b} checked={block === b} onChange={() => setBlockState(b)} className="sr-only" />
                      Block {b}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Room Number</label>
                <input type="text" value={room} onChange={e => setRoomState(e.target.value)} placeholder="e.g. B102" />
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary flex-1" onClick={handleStudentNext} disabled={!block || !room || !name}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="page-card">
              <h2 className="section-title">Worker Details</h2>
              <div className="form-group">
                <label>Your Specialty / Category</label>
                <select value={workerCat} onChange={e => setWorkerCat(e.target.value)}>
                  <option value="">-- Select your category --</option>
                  {ALL_CATEGORIES.filter(c => c !== 'Other').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary flex-1" onClick={handleWorkerNext} disabled={!workerCat}>Continue →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-muted-foreground">
        Hostel Management System • College Administration Portal
      </div>
    </div>
  );
};

export default Index;
