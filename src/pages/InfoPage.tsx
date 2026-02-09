import { useNavigate } from 'react-router-dom';

const InfoPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Role-Based Access',
      desc: 'Three distinct roles — Student, Warden, and Worker — each with tailored dashboards and permissions. Students raise complaints and manage their room. Wardens oversee the entire hostel. Workers handle assigned tasks.',
    },
    {
      title: 'Complaint System',
      desc: 'Students can raise complaints across categories: Housekeeping, AC, Plumbing, Electrical, Carpenter, Water Cooler, and Other. Each complaint gets a unique ID, timestamp, status tracking (Submitted → Seen → In Progress → Resolved → Closed), and priority. Anonymous submissions are supported.',
    },
    {
      title: 'Common Housekeeping Complaints',
      desc: 'All housekeeping-related complaints (Housekeeping, AC, Plumbing, Electrical, Carpenter, Water Cooler) are visible to Students, Wardens, and Workers. This prevents duplicate complaints and increases transparency — students can see if work has already started.',
    },
    {
      title: 'Complaint Reopen',
      desc: 'If a complaint is marked as "Resolved" but the issue persists, students can reopen it with a reason. Reopened complaints are linked to the original ID and automatically receive higher priority.',
    },
    {
      title: 'Room Inventory Checklist',
      desc: 'At semester start, students can check each room item (Bed, Table, Fan, Light, Cupboard, Shoe Rack, Chair) and mark as Working, Damaged, or Missing. Damaged or Missing items automatically generate a linked complaint.',
    },
    {
      title: 'Room Cleaning Schedule',
      desc: 'Floor-wise cleaning schedule displayed in table format showing Floor, Day, and Time. Wardens and Workers can mark cleaning as completed with a timestamp visible to students.',
    },
    {
      title: 'Room Availability & Change Requests',
      desc: 'Students can view available rooms in their block with details (room number, floor, occupancy). They can submit room change requests with a reason. Wardens can approve or reject requests, and room status updates automatically.',
    },
    {
      title: 'Visitor Log System',
      desc: 'Students submit visitor requests with visitor name, date, and time window. Wardens approve or reject. Approved visitors are valid only for the specified time window.',
    },
    {
      title: 'Lost & Found Board',
      desc: 'Simple table-based board with two tabs: Lost Items and Found Items. Anyone can post items with description, location, and date.',
    },
    {
      title: 'Emergency Button',
      desc: 'Fixed-position emergency button always visible on student dashboard. Provides quick access to call Warden, Security, or Medical Room via tel: links.',
    },
    {
      title: 'Data Persistence',
      desc: 'All data is stored in localStorage and persists across page refreshes. No backend server required — the system is fully functional in the browser.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-4 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold">System Information</h1>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>← Back to Login</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="page-card mb-4">
          <h2 className="section-title">About the Hostel Management System</h2>
          <p className="text-sm mb-2">
            This is a comprehensive Hostel Management System designed for college hostels. It provides role-based dashboards for Students, Wardens, and Workers to manage day-to-day hostel operations including complaints, cleaning, room management, visitor logs, and emergency services.
          </p>
          <p className="text-sm text-muted-foreground">
            Built as a browser-based application with localStorage for data persistence. No backend or server setup required.
          </p>
        </div>

        <h2 className="section-title">Features</h2>
        <div className="flex flex-col gap-3">
          {features.map((f, i) => (
            <div key={i} className="page-card">
              <h3 className="font-semibold mb-1">{i + 1}. {f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="page-card mt-4">
          <h2 className="section-title">User Roles Summary</h2>
          <table>
            <thead>
              <tr><th>Feature</th><th>Student</th><th>Warden</th><th>Worker</th></tr>
            </thead>
            <tbody>
              <tr><td>Raise Complaints</td><td>✓</td><td>—</td><td>—</td></tr>
              <tr><td>View Housekeeping Complaints</td><td>✓</td><td>✓</td><td>✓</td></tr>
              <tr><td>Update Complaint Status</td><td>Reopen only</td><td>✓ All</td><td>✓ Assigned</td></tr>
              <tr><td>Room Inventory</td><td>✓ Own room</td><td>✓ View issues</td><td>—</td></tr>
              <tr><td>Cleaning Schedule</td><td>✓ View</td><td>✓ Mark done</td><td>✓ Mark done</td></tr>
              <tr><td>Room Management</td><td>Request change</td><td>✓ Full control</td><td>—</td></tr>
              <tr><td>Visitor Management</td><td>✓ Request</td><td>✓ Approve/Reject</td><td>—</td></tr>
              <tr><td>Lost & Found</td><td>✓</td><td>—</td><td>—</td></tr>
              <tr><td>Emergency Button</td><td>✓</td><td>—</td><td>—</td></tr>
            </tbody>
          </table>
        </div>

        <div className="text-center mt-6 mb-8">
          <button onClick={() => navigate('/')} className="btn-primary">Go to Login</button>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
