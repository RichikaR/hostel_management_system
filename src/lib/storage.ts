// Types
export interface Complaint {
  id: string;
  block: string;
  room: string;
  category: string;
  description: string;
  anonymous: boolean;
  status: 'Submitted' | 'Seen' | 'In Progress' | 'Resolved' | 'Reopened' | 'Closed';
  timestamp: string;
  priority: number;
  reopenReason?: string;
}

export interface CleaningEntry {
  id: string;
  block: string;
  floor: number;
  day: string;
  time: string;
  completed: boolean;
  completedAt?: string;
}

export interface InventoryItem {
  name: string;
  status: 'Working' | 'Damaged' | 'Missing' | 'Not Checked';
}

export interface RoomInventory {
  block: string;
  room: string;
  items: InventoryItem[];
}

export interface Room {
  block: string;
  room: string;
  floor: number;
  status: 'Available' | 'Occupied';
}

export interface RoomChangeRequest {
  id: string;
  studentBlock: string;
  studentRoom: string;
  requestedBlock: string;
  requestedRoom: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
}

export interface VisitorRequest {
  id: string;
  studentName: string;
  block: string;
  room: string;
  visitorName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
}

export interface LostFoundItem {
  id: string;
  type: 'Lost' | 'Found';
  description: string;
  location: string;
  date: string;
  timestamp: string;
}

// Helpers
const genId = () => 'C' + Math.random().toString(36).substring(2, 8).toUpperCase();
const getItems = <T,>(key: string): T[] => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
};
const setItems = <T,>(key: string, items: T[]) => localStorage.setItem(key, JSON.stringify(items));

// Constants
export const HOUSEKEEPING_CATEGORIES = ['Housekeeping', 'AC', 'Plumbing', 'Electrical', 'Carpenter', 'Water Cooler'];
export const ALL_CATEGORIES = [...HOUSEKEEPING_CATEGORIES, 'Other'];
export const INVENTORY_ITEMS = ['Bed', 'Table', 'Fan', 'Light', 'Cupboard', 'Shoe Rack', 'Chair'];

// Role Management
export const getRole = () => localStorage.getItem('hostel_role') || '';
export const setRole = (role: string) => localStorage.setItem('hostel_role', role);
export const getBlock = () => localStorage.getItem('hostel_block') || '';
export const setBlock = (block: string) => localStorage.setItem('hostel_block', block);
export const getRoom = () => localStorage.getItem('hostel_room') || '';
export const setRoom = (room: string) => localStorage.setItem('hostel_room', room);
export const getStudentName = () => localStorage.getItem('hostel_student_name') || '';
export const setStudentName = (name: string) => localStorage.setItem('hostel_student_name', name);
export const getWorkerCategory = () => localStorage.getItem('hostel_worker_category') || '';
export const setWorkerCategory = (cat: string) => localStorage.setItem('hostel_worker_category', cat);
export const clearSession = () => {
  localStorage.removeItem('hostel_role');
  localStorage.removeItem('hostel_block');
  localStorage.removeItem('hostel_room');
  localStorage.removeItem('hostel_student_name');
  localStorage.removeItem('hostel_worker_category');
};

// Complaints
export const getComplaints = () => getItems<Complaint>('hostel_complaints');
export const addComplaint = (c: Omit<Complaint, 'id' | 'timestamp' | 'status' | 'priority'>) => {
  const list = getComplaints();
  const newC: Complaint = { ...c, id: genId(), timestamp: new Date().toISOString(), status: 'Submitted', priority: 1 };
  list.unshift(newC);
  setItems('hostel_complaints', list);
  return newC;
};
export const updateComplaintStatus = (id: string, status: Complaint['status']) => {
  const list = getComplaints();
  const idx = list.findIndex(c => c.id === id);
  if (idx > -1) { list[idx].status = status; setItems('hostel_complaints', list); }
};
export const reopenComplaint = (id: string, reason: string) => {
  const list = getComplaints();
  const idx = list.findIndex(c => c.id === id);
  if (idx > -1) {
    list[idx].status = 'Reopened';
    list[idx].reopenReason = reason;
    list[idx].priority = Math.min(list[idx].priority + 1, 5);
    setItems('hostel_complaints', list);
  }
};
export const getHousekeepingComplaints = () => getComplaints().filter(c => HOUSEKEEPING_CATEGORIES.includes(c.category));

// Cleaning
export const getCleaningSchedule = () => getItems<CleaningEntry>('hostel_cleaning');
export const markCleaningCompleted = (id: string) => {
  const list = getCleaningSchedule();
  const idx = list.findIndex(s => s.id === id);
  if (idx > -1) { list[idx].completed = true; list[idx].completedAt = new Date().toISOString(); setItems('hostel_cleaning', list); }
};

// Room Inventory
export const getRoomInventory = (block: string, room: string): RoomInventory | null => {
  const all = getItems<RoomInventory>('hostel_inventory');
  return all.find(i => i.block === block && i.room === room) || null;
};
export const saveRoomInventory = (inv: RoomInventory) => {
  const all = getItems<RoomInventory>('hostel_inventory');
  const idx = all.findIndex(i => i.block === inv.block && i.room === inv.room);
  if (idx > -1) all[idx] = inv; else all.push(inv);
  setItems('hostel_inventory', all);
};
export const getAllInventoryIssues = () => {
  return getItems<RoomInventory>('hostel_inventory').filter(i => i.items.some(item => item.status === 'Damaged' || item.status === 'Missing'));
};

// Rooms
export const getRooms = () => getItems<Room>('hostel_rooms');
export const getAvailableRooms = (block?: string) => {
  const rooms = getRooms();
  return block ? rooms.filter(r => r.block === block && r.status === 'Available') : rooms.filter(r => r.status === 'Available');
};
export const updateRoomStatus = (block: string, room: string, status: Room['status']) => {
  const rooms = getRooms();
  const idx = rooms.findIndex(r => r.block === block && r.room === room);
  if (idx > -1) { rooms[idx].status = status; setItems('hostel_rooms', rooms); }
};

// Room Change Requests
export const getRoomChangeRequests = () => getItems<RoomChangeRequest>('hostel_room_changes');
export const addRoomChangeRequest = (req: Omit<RoomChangeRequest, 'id' | 'timestamp' | 'status'>) => {
  const list = getRoomChangeRequests();
  list.unshift({ ...req, id: genId(), timestamp: new Date().toISOString(), status: 'Pending' });
  setItems('hostel_room_changes', list);
};
export const updateRoomChangeStatus = (id: string, status: RoomChangeRequest['status']) => {
  const list = getRoomChangeRequests();
  const idx = list.findIndex(r => r.id === id);
  if (idx > -1) {
    list[idx].status = status;
    setItems('hostel_room_changes', list);
    if (status === 'Approved') {
      updateRoomStatus(list[idx].studentBlock, list[idx].studentRoom, 'Available');
      updateRoomStatus(list[idx].requestedBlock, list[idx].requestedRoom, 'Occupied');
    }
  }
};

// Visitors
export const getVisitors = () => getItems<VisitorRequest>('hostel_visitors');
export const addVisitorRequest = (v: Omit<VisitorRequest, 'id' | 'timestamp' | 'status'>) => {
  const list = getVisitors();
  list.unshift({ ...v, id: genId(), timestamp: new Date().toISOString(), status: 'Pending' });
  setItems('hostel_visitors', list);
};
export const updateVisitorStatus = (id: string, status: VisitorRequest['status']) => {
  const list = getVisitors();
  const idx = list.findIndex(v => v.id === id);
  if (idx > -1) { list[idx].status = status; setItems('hostel_visitors', list); }
};

// Lost & Found
export const getLostFound = () => getItems<LostFoundItem>('hostel_lostfound');
export const addLostFound = (item: Omit<LostFoundItem, 'id' | 'timestamp'>) => {
  const list = getLostFound();
  list.unshift({ ...item, id: genId(), timestamp: new Date().toISOString() });
  setItems('hostel_lostfound', list);
};

// Initialize default data
export const initializeData = () => {
  if (localStorage.getItem('hostel_initialized')) return;

  // Rooms
  const rooms: Room[] = [];
  ['B', 'C'].forEach(block => {
    for (let floor = 1; floor <= 4; floor++) {
      for (let num = 1; num <= 10; num++) {
        rooms.push({
          block,
          room: `${block}${floor}${num.toString().padStart(2, '0')}`,
          floor,
          status: Math.random() > 0.2 ? 'Occupied' : 'Available',
        });
      }
    }
  });
  setItems('hostel_rooms', rooms);

  // Cleaning schedule
  const cleaning: CleaningEntry[] = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  ['B', 'C'].forEach(block => {
    for (let floor = 1; floor <= 4; floor++) {
      days.forEach(day => {
        cleaning.push({
          id: `${block}F${floor}-${day}`,
          block,
          floor,
          day,
          time: floor <= 2 ? '08:00 AM' : '09:30 AM',
          completed: false,
        });
      });
    }
  });
  setItems('hostel_cleaning', cleaning);

  // Sample complaints
  const complaints: Complaint[] = [
    { id: 'S001', block: 'B', room: 'B102', category: 'Plumbing', description: 'Leaking tap in bathroom', anonymous: false, status: 'Submitted', timestamp: new Date(Date.now() - 86400000).toISOString(), priority: 1 },
    { id: 'S002', block: 'C', room: 'C205', category: 'Electrical', description: 'Tube light flickering', anonymous: false, status: 'In Progress', timestamp: new Date(Date.now() - 172800000).toISOString(), priority: 1 },
    { id: 'S003', block: 'B', room: 'B310', category: 'AC', description: 'AC not cooling, making unusual noise', anonymous: true, status: 'Seen', timestamp: new Date(Date.now() - 43200000).toISOString(), priority: 1 },
    { id: 'S004', block: 'C', room: 'C108', category: 'Housekeeping', description: 'Room not cleaned for 2 days', anonymous: false, status: 'Resolved', timestamp: new Date(Date.now() - 259200000).toISOString(), priority: 1 },
  ];
  setItems('hostel_complaints', complaints);

  localStorage.setItem('hostel_initialized', 'true');
};

// Status badge class helper
export const statusClass = (status: string) => {
  return 'badge badge-' + status.toLowerCase().replace(/\s+/g, '-');
};
