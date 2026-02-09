import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import * as S from '@/lib/storage';

const TABS = ['Dashboard', 'All Complaints', 'Housekeeping', 'Inventory Issues', 'Cleaning Schedule', 'Room Management', 'Room Changes', 'Visitor Management'];

const WardenDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const [complaints, setComplaints] = useState<S.Complaint[]>([]);
  const [housekeeping, setHousekeeping] = useState<S.Complaint[]>([]);
  const [cleaning, setCleaning] = useState<S.CleaningEntry[]>([]);
  const [rooms, setRooms] = useState<S.Room[]>([]);
  const [roomChanges, setRoomChanges] = useState<S.RoomChangeRequest[]>([]);
  const [visitors, setVisitors] = useState<S.VisitorRequest[]>([]);
  const [inventoryIssues, setInventoryIssues] = useState<S.RoomInventory[]>([]);
  const [filterBlock, setFilterBlock] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [msg, setMsg] = useState('');

  const refresh = useCallback(() => {
    setComplaints(S.getComplaints());
    setHousekeeping(S.getHousekeepingComplaints());
    setCleaning(S.getCleaningSchedule());
    setRooms(S.getRooms());
    setRoomChanges(S.getRoomChangeRequests());
    setVisitors(S.getVisitors());
    setInventoryIssues(S.getAllInventoryIssues());
  }, []);

  useEffect(() => {
    if (!S.getRole()) { navigate('/'); return; }
    refresh();
  }, [navigate, refresh]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleComplaintStatus = (id: string, status: S.Complaint['status']) => {
    S.updateComplaintStatus(id, status);
    refresh();
    flash(`Complaint ${id} updated to ${status}.`);
  };

  const handleCleaningComplete = (id: string) => {
    S.markCleaningCompleted(id);
    refresh();
    flash('Cleaning marked as completed.');
  };

  const handleRoomChange = (id: string, status: S.RoomChangeRequest['status']) => {
    S.updateRoomChangeStatus(id, status);
    refresh();
    flash(`Room change request ${status.toLowerCase()}.`);
  };

  const handleVisitor = (id: string, status: S.VisitorRequest['status']) => {
    S.updateVisitorStatus(id, status);
    refresh();
    flash(`Visitor request ${status.toLowerCase()}.`);
  };

  const handleRoomStatus = (block: string, room: string, status: S.Room['status']) => {
    S.updateRoomStatus(block, room, status);
    refresh();
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterBlock && c.block !== filterBlock) return false;
    if (filterStatus && c.status !== filterStatus) return false;
    return true;
  });

  const totalPending = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const pendingVisitors = visitors.filter(v => v.status === 'Pending').length;
  const pendingRoomChanges = roomChanges.filter(r => r.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="mb-1">Warden Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-3">Full administrative access</p>

        {msg && <div className="flash-msg">{msg}</div>}

        <div className="flex flex-wrap border-b border-border mb-4">
          {TABS.map(t => (
            <button key={t} className={`nav-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); refresh(); }}>{t}</button>
          ))}
        </div>

        {/* DASHBOARD */}
        {tab === 'Dashboard' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="stat-card"><div className="stat-value">{complaints.length}</div><div className="stat-label">Total Complaints</div></div>
              <div className="stat-card"><div className="stat-value">{totalPending}</div><div className="stat-label">Pending</div></div>
              <div className="stat-card"><div className="stat-value">{pendingVisitors}</div><div className="stat-label">Visitor Requests</div></div>
              <div className="stat-card"><div className="stat-value">{pendingRoomChanges}</div><div className="stat-label">Room Changes</div></div>
            </div>
            <div className="page-card">
              <h3 className="mb-2">Recent Complaints</h3>
              <table>
                <thead><tr><th>ID</th><th>Block</th><th>Room</th><th>Category</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {complaints.slice(0, 8).map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.block}</td>
                      <td>{c.anonymous ? 'Anonymous' : c.room}</td>
                      <td>{c.category}</td>
                      <td><span className={S.statusClass(c.status)}>{c.status}</span></td>
                      <td>{new Date(c.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALL COMPLAINTS */}
        {tab === 'All Complaints' && (
          <div className="page-card">
            <h2 className="section-title">All Complaints</h2>
            <div className="flex gap-3 mb-3">
              <select value={filterBlock} onChange={e => setFilterBlock(e.target.value)} style={{ width: 'auto' }}>
                <option value="">All Blocks</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
                <option value="">All Statuses</option>
                {['Submitted', 'Seen', 'In Progress', 'Resolved', 'Reopened', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>ID</th><th>Block</th><th>Room</th><th>Category</th><th>Description</th><th>Status</th><th>Priority</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredComplaints.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.block}</td>
                      <td>{c.anonymous ? 'Anon' : c.room}</td>
                      <td>{c.category}</td>
                      <td className="max-w-xs text-xs">{c.description}</td>
                      <td><span className={S.statusClass(c.status)}>{c.status}</span></td>
                      <td>{c.priority}</td>
                      <td className="text-xs">{new Date(c.timestamp).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={c.status}
                          onChange={e => handleComplaintStatus(c.id, e.target.value as S.Complaint['status'])}
                          style={{ width: 'auto', padding: '2px 4px', fontSize: '11px' }}
                        >
                          {['Submitted', 'Seen', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HOUSEKEEPING */}
        {tab === 'Housekeeping' && (
          <div className="page-card">
            <h2 className="section-title">Common Housekeeping Complaints</h2>
            <p className="text-xs text-muted-foreground mb-3">Shared view: Housekeeping, AC, Plumbing, Electrical, Carpenter, Water Cooler</p>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>ID</th><th>Block</th><th>Room</th><th>Category</th><th>Description</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
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
                      <td>
                        <select value={c.status} onChange={e => handleComplaintStatus(c.id, e.target.value as S.Complaint['status'])} style={{ width: 'auto', padding: '2px 4px', fontSize: '11px' }}>
                          {['Submitted', 'Seen', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {housekeeping.length === 0 && <tr><td colSpan={8} className="text-center text-muted-foreground">No housekeeping complaints.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INVENTORY ISSUES */}
        {tab === 'Inventory Issues' && (
          <div className="page-card">
            <h2 className="section-title">Room Inventory Issues</h2>
            {inventoryIssues.length === 0 ? <p className="text-sm text-muted-foreground">No inventory issues reported.</p> : (
              <table>
                <thead><tr><th>Block</th><th>Room</th><th>Item</th><th>Status</th></tr></thead>
                <tbody>
                  {inventoryIssues.flatMap(inv =>
                    inv.items.filter(item => item.status === 'Damaged' || item.status === 'Missing').map(item => (
                      <tr key={`${inv.block}${inv.room}-${item.name}`}>
                        <td>{inv.block}</td>
                        <td>{inv.room}</td>
                        <td>{item.name}</td>
                        <td><span className={S.statusClass(item.status)}>{item.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* CLEANING SCHEDULE */}
        {tab === 'Cleaning Schedule' && (
          <div className="page-card">
            <h2 className="section-title">Cleaning Schedule — All Blocks</h2>
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

        {/* ROOM MANAGEMENT */}
        {tab === 'Room Management' && (
          <div className="page-card">
            <h2 className="section-title">Room Management</h2>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Block</th><th>Room</th><th>Floor</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {rooms.map(r => (
                    <tr key={`${r.block}${r.room}`}>
                      <td>{r.block}</td>
                      <td>{r.room}</td>
                      <td>Floor {r.floor}</td>
                      <td><span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span></td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '2px 8px', fontSize: '11px' }}
                          onClick={() => handleRoomStatus(r.block, r.room, r.status === 'Available' ? 'Occupied' : 'Available')}
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROOM CHANGES */}
        {tab === 'Room Changes' && (
          <div className="page-card">
            <h2 className="section-title">Room Change Requests</h2>
            {roomChanges.length === 0 ? <p className="text-sm text-muted-foreground">No requests.</p> : (
              <table>
                <thead><tr><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {roomChanges.map(r => (
                    <tr key={r.id}>
                      <td>{r.studentRoom}</td>
                      <td>{r.requestedRoom}</td>
                      <td className="max-w-xs text-xs">{r.reason}</td>
                      <td><span className={S.statusClass(r.status)}>{r.status}</span></td>
                      <td className="text-xs">{new Date(r.timestamp).toLocaleDateString()}</td>
                      <td>
                        {r.status === 'Pending' && (
                          <div className="flex gap-1">
                            <button className="btn-success" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => handleRoomChange(r.id, 'Approved')}>Approve</button>
                            <button className="btn-danger" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => handleRoomChange(r.id, 'Rejected')}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* VISITOR MANAGEMENT */}
        {tab === 'Visitor Management' && (
          <div className="page-card">
            <h2 className="section-title">Visitor Requests</h2>
            {visitors.length === 0 ? <p className="text-sm text-muted-foreground">No visitor requests.</p> : (
              <table>
                <thead><tr><th>Student</th><th>Block/Room</th><th>Visitor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {visitors.map(v => (
                    <tr key={v.id}>
                      <td>{v.studentName}</td>
                      <td>{v.block}-{v.room}</td>
                      <td>{v.visitorName}</td>
                      <td>{v.date}</td>
                      <td>{v.startTime}–{v.endTime}</td>
                      <td><span className={S.statusClass(v.status)}>{v.status}</span></td>
                      <td>
                        {v.status === 'Pending' && (
                          <div className="flex gap-1">
                            <button className="btn-success" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => handleVisitor(v.id, 'Approved')}>Approve</button>
                            <button className="btn-danger" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => handleVisitor(v.id, 'Rejected')}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WardenDashboard;
