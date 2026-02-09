import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import * as S from '@/lib/storage';

const TABS = ['My Assignments', 'Housekeeping Complaints', 'Cleaning Tasks'];

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('My Assignments');
  const workerCategory = S.getWorkerCategory();
  const [complaints, setComplaints] = useState<S.Complaint[]>([]);
  const [housekeeping, setHousekeeping] = useState<S.Complaint[]>([]);
  const [cleaning, setCleaning] = useState<S.CleaningEntry[]>([]);
  const [msg, setMsg] = useState('');

  const refresh = useCallback(() => {
    setComplaints(S.getComplaints().filter(c => c.category === workerCategory));
    setHousekeeping(S.getHousekeepingComplaints());
    setCleaning(S.getCleaningSchedule());
  }, [workerCategory]);

  useEffect(() => {
    if (!S.getRole()) { navigate('/'); return; }
    refresh();
  }, [navigate, refresh]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleStatus = (id: string, status: S.Complaint['status']) => {
    S.updateComplaintStatus(id, status);
    refresh();
    flash(`Complaint ${id} updated to ${status}.`);
  };

  const handleCleaningComplete = (id: string) => {
    S.markCleaningCompleted(id);
    refresh();
    flash('Cleaning task marked as completed.');
  };

  const assigned = complaints;
  const pendingAssigned = assigned.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="mb-1">Worker Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-3">Category: {workerCategory}</p>

        {msg && <div className="flash-msg">{msg}</div>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="stat-card"><div className="stat-value">{assigned.length}</div><div className="stat-label">Assigned</div></div>
          <div className="stat-card"><div className="stat-value">{pendingAssigned}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card"><div className="stat-value">{cleaning.filter(c => !c.completed).length}</div><div className="stat-label">Cleaning Pending</div></div>
        </div>

        <div className="flex flex-wrap border-b border-border mb-4">
          {TABS.map(t => (
            <button key={t} className={`nav-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); refresh(); }}>{t}</button>
          ))}
        </div>

        {/* MY ASSIGNMENTS */}
        {tab === 'My Assignments' && (
          <div className="page-card">
            <h2 className="section-title">Complaints Assigned to Me ({workerCategory})</h2>
            {assigned.length === 0 ? <p className="text-sm text-muted-foreground">No complaints assigned to your category.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>ID</th><th>Block</th><th>Room</th><th>Description</th><th>Status</th><th>Priority</th><th>Date</th><th>Update</th></tr></thead>
                  <tbody>
                    {assigned.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.block}</td>
                        <td>{c.anonymous ? 'Anon' : c.room}</td>
                        <td className="max-w-xs text-xs">{c.description}</td>
                        <td><span className={S.statusClass(c.status)}>{c.status}</span></td>
                        <td>{c.priority}</td>
                        <td className="text-xs">{new Date(c.timestamp).toLocaleDateString()}</td>
                        <td>
                          <select
                            value={c.status}
                            onChange={e => handleStatus(c.id, e.target.value as S.Complaint['status'])}
                            style={{ width: 'auto', padding: '2px 4px', fontSize: '11px' }}
                          >
                            {['Seen', 'In Progress', 'Resolved'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* HOUSEKEEPING COMPLAINTS */}
        {tab === 'Housekeeping Complaints' && (
          <div className="page-card">
            <h2 className="section-title">Common Housekeeping Complaints (Read-Only)</h2>
            <p className="text-xs text-muted-foreground mb-3">Shared view of all housekeeping-related complaints across blocks.</p>
            {housekeeping.length === 0 ? <p className="text-sm text-muted-foreground">No housekeeping complaints.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>ID</th><th>Block</th><th>Room</th><th>Category</th><th>Description</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {housekeeping.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.block}</td>
                        <td>{c.anonymous ? 'Anon' : c.room}</td>
                        <td>{c.category}</td>
                        <td className="max-w-xs text-xs">{c.description}</td>
                        <td><span className={S.statusClass(c.status)}>{c.status}</span></td>
                        <td className="text-xs">{new Date(c.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CLEANING TASKS */}
        {tab === 'Cleaning Tasks' && (
          <div className="page-card">
            <h2 className="section-title">Cleaning Tasks</h2>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Block</th><th>Floor</th><th>Day</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {cleaning.map(c => (
                    <tr key={c.id}>
                      <td>{c.block}</td>
                      <td>Floor {c.floor}</td>
                      <td>{c.day}</td>
                      <td>{c.time}</td>
                      <td>
                        {c.completed
                          ? <span className="badge badge-resolved">✓ Done {c.completedAt ? new Date(c.completedAt).toLocaleTimeString() : ''}</span>
                          : <span className="badge badge-seen">Pending</span>
                        }
                      </td>
                      <td>
                        {!c.completed && (
                          <button className="btn-success" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => handleCleaningComplete(c.id)}>
                            Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
