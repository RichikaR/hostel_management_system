import { useNavigate, useLocation } from 'react-router-dom';
import { getRole, getBlock, getRoom, clearSession, getWorkerCategory } from '@/lib/storage';

const Navigation = () => {
  const navigate = useNavigate();
  const loc = useLocation();
  const role = getRole();
  const block = getBlock();
  const room = getRoom();
  const base = role === 'Student' ? '/student' : role === 'Warden' ? '/warden' : '/worker';

  const links = [
    { path: base, label: 'Dashboard' },
    { path: '/info', label: 'Info' },
  ];

  const handleLogout = () => { clearSession(); navigate('/'); };

  return (
    <nav className="header-bar">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-6">
          <div className="py-3">
            <span className="font-bold text-sm tracking-wide">HMS</span>
            <span className="text-xs ml-2 font-medium" style={{ opacity: 0.7 }}>|</span>
          </div>
          <div className="flex">
            {links.map(l => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                className="px-4 py-3 text-sm border-none cursor-pointer font-medium"
                style={{
                  background: loc.pathname === l.path ? 'hsl(220, 65%, 42%)' : 'transparent',
                  color: 'white',
                  borderRadius: '4px 4px 0 0',
                  opacity: loc.pathname === l.path ? 1 : 0.8,
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-semibold block">{role}</span>
            <span className="text-xs block" style={{ opacity: 0.7 }}>
              {block ? `Block ${block}` : ''}{room ? ` • ${room}` : ''}{role === 'Worker' ? getWorkerCategory() : ''}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '5px 14px', fontSize: '12px', background: 'transparent', color: 'white', borderColor: 'hsl(220, 60%, 60%)' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
