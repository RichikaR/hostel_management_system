import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import EmergencyButton from '@/components/EmergencyButton';
import * as S from '@/lib/storage';

const TABS = ['Dashboard', 'Raise Complaint', 'Common Complaints', 'My Complaints', 'Room Inventory', 'Cleaning Schedule', 'Lost & Found', 'Room Availability', 'Visitor Request'];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const block = S.getBlock();
  const room = S.getRoom();
  const studentName = S.getStudentName();

  const [complaints, setComplaints] = useState<S.Complaint[]>([]);
  const [housekeeping, setHousekeeping] = useState<S.Complaint[]>([]);
  const [cleaning, setCleaning] = useState<S.CleaningEntry[]>([]);
  const [lostFound, setLostFound] = useState<S.LostFoundItem[]>([]);
  const [availableRooms, setAvailableRooms] = useState<S.Room[]>([]);
  const [roomChanges, setRoomChanges] = useState<S.RoomChangeRequest[]>([]);
  const [visitors, setVisitors] = useState<S.VisitorRequest[]>([]);
  const [inventory, setInventory] = useState<S.RoomInventory | null>(null);

  // Forms
  const [cForm, setCForm] = useState({ room: room, category: '', description: '', anonymous: false });
  const [lfForm, setLfForm] = useState({ type: 'Lost' as 'Lost' | 'Found', description: '', location: '', date: '' });
  const [rcForm, setRcForm] = useState({ selectedRoom: '', reason: '' });
  const [vForm, setVForm] = useState({ visitorName: '', date: '', startTime: '', endTime: '' });
  const [reopenId, setReopenId] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState('');
  const [lfTab, setLfTab] = useState<'Lost' | 'Found'>('Lost');
  const [msg, setMsg] = useState('');

  const refresh = useCallback(() => {
    setComplaints(S.getComplaints());
    setHousekeeping(S.getHousekeepingComplaints());
    setCleaning(S.getCleaningSchedule().filter(c => c.block === block));
    setLostFound(S.getLostFound());
    setAvailableRooms(S.getAvailableRooms(block));
    setRoomChanges(S.getRoomChangeRequests().filter(r => r.studentBlock === block && r.studentRoom === room));
    setVisitors(S.getVisitors().filter(v => v.block === block && v.room === room));
    setInventory(S.getRoomInventory(block, room));
  }, [block, room]);

  useEffect(() => {
    if (!S.getRole()) { navigate('/'); return; }
    refresh();
  }, [navigate, refresh]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const submitComplaint = () => {
    if (!cForm.category || !cForm.description) return;
    S.addComplaint({ block, room: cForm.room, category: cForm.category, description: cForm.description, anonymous: cForm.anonymous });
    setCForm({ room, category: '', description: '', anonymous: false });
    refresh();
    flash('Complaint submitted successfully.');
    setTab('My Complaints');
  };

  const handleReopen = (id: string) => {
    if (!reopenReason.trim()) return;
    S.reopenComplaint(id, reopenReason);
    setReopenId(null);
    setReopenReason('');
    refresh();
    flash('Complaint reopened.');
  };

  const submitLostFound = () => {
    if (!lfForm.description || !lfForm.location || !lfForm.date) return;
    S.addLostFound({ type: lfForm.type, description: lfForm.description, location: lfForm.location, date: lfForm.date });
    setLfForm({ type: 'Lost', description: '', location: '', date: '' });
    refresh();
    flash('Item posted successfully.');
  };

  const submitRoomChange = () => {
    if (!rcForm.selectedRoom || !rcForm.reason) return;
    const targetRoom = availableRooms.find(r => r.room === rcForm.selectedRoom);
    if (!targetRoom) return;
    S.addRoomChangeRequest({ studentBlock: block, studentRoom: room, requestedBlock: targetRoom.block, requestedRoom: targetRoom.room, reason: rcForm.reason });
    setRcForm({ selectedRoom: '', reason: '' });
    refresh();
    flash('Room change request submitted.');
  };

  const submitVisitor = () => {
    if (!vForm.visitorName || !vForm.date || !vForm.startTime || !vForm.endTime) return;
    S.addVisitorRequest({ studentName, block, room, visitorName: vForm.visitorName, date: vForm.date, startTime: vForm.startTime, endTime: vForm.endTime });
    setVForm({ visitorName: '', date: '', startTime: '', endTime: '' });
    refresh();
    flash('Visitor request submitted.');
  };

  const saveInventory = (items: S.InventoryItem[]) => {
    S.saveRoomInventory({ block, room, items });
    // Auto-create complaints for damaged/missing
    items.forEach(item => {
      if (item.status === 'Damaged' || item.status === 'Missing') {
        const existing = S.getComplaints().find(c => c.description.includes(`[Inventory] ${item.name}`) && c.room === room);
        if (!existing) {
          S.addComplaint({ block, room, category: 'Other', description: `[Inventory] ${item.name} is ${item.status.toLowerCase()}`, anonymous: false });
        }
      }
    });
    refresh();
    flash('Inventory saved.');
  };

  const myComplaints = complaints.filter(c => !c.anonymous && c.block === block && c.room === room);
  const totalComplaints = myComplaints.length;
  const pendingComplaints = myComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <EmergencyButton />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-1">
          <h1>Student Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Block {block} | Room {room} | {studentName}</p>

        {msg && <div className="flash-msg">{msg}</div>}

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-border mb-4 gap-0">
          {TABS.map(t => (
            <button key={t} className={`nav-tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); refresh(); }}>{t}</button>
          ))}
        </div>

        {/* DASHBOARD */}
        {tab === 'Dashboard' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="stat-card"><div className="stat-value">{totalComplaints}</div><div className="stat-label">Total Complaints</div></div>
              <div className="stat-card"><div className="stat-value">{pendingComplaints}</div><div className="stat-label">Pending</div></div>
              <div className="stat-card"><div className="stat-value">{availableRooms.length}</div><div className="stat-label">Available Rooms</div></div>
              <div className="stat-card"><div className="stat-value">{visitors.filter(v => v.status === 'Pending').length}</div><div className="stat-label">Pending Visits</div></div>
            </div>
            <div className="page-card">
              <h3 className="mb-2">Recent Complaints</h3>
              {myComplaints.length === 0 ? <p className="text-sm text-muted-foreground">No complaints yet.</p> : (
                <table>
                  <thead><tr><th>ID</th><th>Category</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {myComplaints.slice(0, 5).map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.category}</td>
                        <td><span className={S.statusClass(c.status)}>{c.status}</span></td>
                        <td>{new Date(c.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* RAISE COMPLAINT */}
        {tab === 'Raise Complaint' && (
          <div className="page-card max-w-lg">
            <h2 className="section-title">Raise a Complaint</h2>
            <div className="form-group">
              <label>Block</label>
              <input type="text" value={block} disabled />
            </div>
            <div className="form-group">
              <label>Room Number</label>
              <input type="text" value={cForm.room} onChange={e => setCForm({ ...cForm, room: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={cForm.category} onChange={e => setCForm({ ...cForm, category: e.target.value })}>
                <option value="">-- Select Category --</option>
                {S.ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea rows={3} value={cForm.description} onChange={e => setCForm({ ...cForm, description: e.target.value })} placeholder="Describe the issue..." />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={cForm.anonymous} onChange={e => setCForm({ ...cForm, anonymous: e.target.checked })} />
                <span className="text-sm">Submit Anonymously</span>
              </label>
            </div>
            <button className="btn-primary" onClick={submitComplaint}>Submit Complaint</button>
          </div>
        )}

        {/* COMMON HOUSEKEEPING COMPLAINTS */}
        {tab === 'Common Complaints' && (
          <div className="page-card">
            <h2 className="section-title">Common Housekeeping Complaints</h2>
            <p className="text-xs text-muted-foreground mb-3">Visible to all students, wardens, and workers to prevent duplicate complaints and increase transparency.</p>
            {housekeeping.length === 0 ? <p className="text-sm text-muted-foreground">No housekeeping complaints.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>ID</th><th>Block</th><th>Room</th><th>Category</th><th>Description</th><th>Status</th><th>Date</th></tr></thead>
                  <tbody>
                    {housekeeping.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.block}</td>
                        <td>{c.anonymous ? 'Anonymous' : c.room}</td>
                        <td>{c.category}</td>
                        <td className="max-w-xs">{c.description}</td>
                        <td><span className={S.statusClass(c.status)}>{c.status}</span></td>
                        <td>{new Date(c.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MY COMPLAINTS */}
        {tab === 'My Complaints' && (
          <div className="page-card">
            <h2 className="section-title">My Complaints</h2>
            {myComplaints.length === 0 ? <p className="text-sm text-muted-foreground">No complaints filed yet.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>ID</th><th>Category</th><th>Description</th><th>Status</th><th>Priority</th><th>Date</th><th>Action</th></tr></thead>
                  <tbody>
                    {myComplaints.map(c => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.category}</td>
                        <td className="max-w-xs">{c.description}</td>
                        <td><span className={S.statusClass(c.status)}>{c.status}</span></td>
                        <td>{c.priority}</td>
                        <td>{new Date(c.timestamp).toLocaleDateString()}</td>
                        <td>
                          {c.status === 'Resolved' && (
                            reopenId === c.id ? (
                              <div className="flex flex-col gap-1">
                                <input type="text" placeholder="Reason to reopen" value={reopenReason} onChange={e => setReopenReason(e.target.value)} style={{ width: '150px' }} />
                                <div className="flex gap-1">
                                  <button className="btn-danger" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => handleReopen(c.id)}>Submit</button>
                                  <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => setReopenId(null)}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button className="btn-warning" style={{ padding: '2px 8px', fontSize: '11px', color: 'white' }} onClick={() => setReopenId(c.id)}>Reopen</button>
                            )
                          )}
                          {c.reopenReason && <div className="text-xs text-muted-foreground mt-1">Reopen: {c.reopenReason}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ROOM INVENTORY */}
        {tab === 'Room Inventory' && (
          <div className="page-card max-w-lg">
            <h2 className="section-title">Room Inventory Checklist</h2>
            <p className="text-xs text-muted-foreground mb-3">Room {room} — Mark the condition of each item. Damaged or missing items will auto-generate a complaint.</p>
            <InventoryForm initial={inventory} onSave={saveInventory} />
          </div>
        )}

        {/* CLEANING SCHEDULE */}
        {tab === 'Cleaning Schedule' && (
          <div className="page-card">
            <h2 className="section-title">Room Cleaning Schedule — Block {block}</h2>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Floor</th><th>Day</th><th>Time</th><th>Status</th></tr></thead>
                <tbody>
                  {cleaning.map(c => (
                    <tr key={c.id}>
                      <td>Floor {c.floor}</td>
                      <td>{c.day}</td>
                      <td>{c.time}</td>
                      <td>
                        {c.completed
                          ? <span className="badge badge-resolved">✓ Completed {c.completedAt ? `at ${new Date(c.completedAt).toLocaleTimeString()}` : ''}</span>
                          : <span className="badge badge-seen">Pending</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOST & FOUND */}
        {tab === 'Lost & Found' && (
          <div>
            <div className="page-card max-w-lg mb-4">
              <h2 className="section-title">Post Lost / Found Item</h2>
              <div className="form-group">
                <label>Type</label>
                <select value={lfForm.type} onChange={e => setLfForm({ ...lfForm, type: e.target.value as 'Lost' | 'Found' })}>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>
              <div className="form-group">
                <label>Item Description *</label>
                <input type="text" value={lfForm.description} onChange={e => setLfForm({ ...lfForm, description: e.target.value })} placeholder="e.g. Blue water bottle" />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input type="text" value={lfForm.location} onChange={e => setLfForm({ ...lfForm, location: e.target.value })} placeholder="e.g. Common room, Block B" />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={lfForm.date} onChange={e => setLfForm({ ...lfForm, date: e.target.value })} />
              </div>
              <button className="btn-primary" onClick={submitLostFound}>Post Item</button>
            </div>
            <div className="page-card">
              <div className="flex gap-2 mb-3">
                <button className={`nav-tab ${lfTab === 'Lost' ? 'active' : ''}`} onClick={() => setLfTab('Lost')}>Lost Items</button>
                <button className={`nav-tab ${lfTab === 'Found' ? 'active' : ''}`} onClick={() => setLfTab('Found')}>Found Items</button>
              </div>
              <table>
                <thead><tr><th>Description</th><th>Location</th><th>Date</th><th>Posted</th></tr></thead>
                <tbody>
                  {lostFound.filter(i => i.type === lfTab).map(i => (
                    <tr key={i.id}>
                      <td>{i.description}</td>
                      <td>{i.location}</td>
                      <td>{i.date}</td>
                      <td>{new Date(i.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {lostFound.filter(i => i.type === lfTab).length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted-foreground">No {lfTab.toLowerCase()} items.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROOM AVAILABILITY */}
        {tab === 'Room Availability' && (
          <div>
            <div className="page-card">
              <h2 className="section-title">Available Rooms — Block {block}</h2>
              {availableRooms.length === 0 ? <p className="text-sm text-muted-foreground">No available rooms in Block {block}.</p> : (
                <table>
                  <thead><tr><th>Room</th><th>Floor</th><th>Status</th></tr></thead>
                  <tbody>
                    {availableRooms.map(r => (
                      <tr key={r.room}>
                        <td>{r.room}</td>
                        <td>Floor {r.floor}</td>
                        <td><span className="badge badge-available">Available</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="page-card max-w-lg">
              <h3 className="section-title">Request Room Change</h3>
              <div className="form-group">
                <label>Select Available Room *</label>
                <select value={rcForm.selectedRoom} onChange={e => setRcForm({ ...rcForm, selectedRoom: e.target.value })}>
                  <option value="">-- Select Room --</option>
                  {availableRooms.map(r => <option key={r.room} value={r.room}>{r.room} (Floor {r.floor})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Reason for Change *</label>
                <textarea rows={2} value={rcForm.reason} onChange={e => setRcForm({ ...rcForm, reason: e.target.value })} placeholder="Why do you want to change rooms?" />
              </div>
              <button className="btn-primary" onClick={submitRoomChange}>Submit Request</button>
              {roomChanges.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">My Room Change Requests</h4>
                  <table>
                    <thead><tr><th>Requested Room</th><th>Reason</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {roomChanges.map(r => (
                        <tr key={r.id}>
                          <td>{r.requestedRoom}</td>
                          <td>{r.reason}</td>
                          <td><span className={S.statusClass(r.status)}>{r.status}</span></td>
                          <td>{new Date(r.timestamp).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISITOR REQUEST */}
        {tab === 'Visitor Request' && (
          <div>
            <div className="page-card max-w-lg mb-4">
              <h2 className="section-title">Submit Visitor Request</h2>
              <div className="form-group">
                <label>Visitor Name *</label>
                <input type="text" value={vForm.visitorName} onChange={e => setVForm({ ...vForm, visitorName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Visit Date *</label>
                <input type="date" value={vForm.date} onChange={e => setVForm({ ...vForm, date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label>Start Time *</label>
                  <input type="time" value={vForm.startTime} onChange={e => setVForm({ ...vForm, startTime: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input type="time" value={vForm.endTime} onChange={e => setVForm({ ...vForm, endTime: e.target.value })} />
                </div>
              </div>
              <button className="btn-primary" onClick={submitVisitor}>Submit Request</button>
            </div>
            <div className="page-card">
              <h3 className="section-title">My Visitor Requests</h3>
              <table>
                <thead><tr><th>Visitor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                <tbody>
                  {visitors.map(v => (
                    <tr key={v.id}>
                      <td>{v.visitorName}</td>
                      <td>{v.date}</td>
                      <td>{v.startTime} - {v.endTime}</td>
                      <td><span className={S.statusClass(v.status)}>{v.status}</span></td>
                    </tr>
                  ))}
                  {visitors.length === 0 && <tr><td colSpan={4} className="text-center text-muted-foreground">No visitor requests.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Room Inventory sub-component
const InventoryForm = ({ initial, onSave }: { initial: S.RoomInventory | null; onSave: (items: S.InventoryItem[]) => void }) => {
  const [items, setItems] = useState<S.InventoryItem[]>(
    initial?.items || S.INVENTORY_ITEMS.map(name => ({ name, status: 'Not Checked' as const }))
  );

  const updateItem = (idx: number, status: S.InventoryItem['status']) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], status };
    setItems(updated);
  };

  return (
    <div>
      <table>
        <thead><tr><th>Item</th><th>Working</th><th>Damaged</th><th>Missing</th></tr></thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.name}>
              <td className="font-medium">{item.name}</td>
              <td><input type="radio" name={`inv-${i}`} checked={item.status === 'Working'} onChange={() => updateItem(i, 'Working')} /></td>
              <td><input type="radio" name={`inv-${i}`} checked={item.status === 'Damaged'} onChange={() => updateItem(i, 'Damaged')} /></td>
              <td><input type="radio" name={`inv-${i}`} checked={item.status === 'Missing'} onChange={() => updateItem(i, 'Missing')} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-primary mt-3" onClick={() => onSave(items)}>Save Inventory</button>
    </div>
  );
};

export default StudentDashboard;
