import { useState } from 'react';

const EmergencyButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="emergency-btn" onClick={() => setOpen(!open)}>
        🚨 EMERGENCY
      </button>
      {open && (
        <div className="fixed z-50 bg-card border border-border rounded-sm p-4" style={{ bottom: '70px', right: '20px', width: '220px' }}>
          <h3 className="text-sm font-bold mb-2">Emergency Contacts</h3>
          <div className="flex flex-col gap-2">
            <a href="tel:+911234567890" className="btn-danger text-center text-sm no-underline">📞 Call Warden</a>
            <a href="tel:+911234567891" className="btn-warning text-center text-sm no-underline" style={{ color: 'white' }}>📞 Call Security</a>
            <a href="tel:+911234567892" className="btn-success text-center text-sm no-underline">📞 Call Medical Room</a>
          </div>
          <button onClick={() => setOpen(false)} className="btn-secondary w-full mt-2 text-xs">Close</button>
        </div>
      )}
    </>
  );
};

export default EmergencyButton;
