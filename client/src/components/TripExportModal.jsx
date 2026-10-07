import React, { useState } from 'react';
import { X, Printer, Copy, Check, Download, FileText, Calendar, MapPin, DollarSign } from 'lucide-react';

export default function TripExportModal({ isOpen, onClose, trip }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(trip, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trip, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${trip.destination.toLowerCase()}-trip-plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const totalSpent = (trip.expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog"
        style={{ maxWidth: '780px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.25rem' }}>Export & Print Travel Summary</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Printable Document Preview Area */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            color: 'var(--text-primary)'
          }}>
            <div style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <span className="badge badge-upcoming" style={{ marginBottom: '0.4rem' }}>
                VOYAGECRAFT ITINERARY
              </span>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0' }}>
                {trip.flag} {trip.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <span>📍 {trip.destination}, {trip.country}</span>
                <span>📅 {trip.startDate} to {trip.endDate}</span>
                <span>💰 Budget: ${trip.budget} (Spent: ${totalSpent})</span>
              </div>
              {trip.notes && (
                <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  Notes: {trip.notes}
                </p>
              )}
            </div>

            {/* Daily schedule */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(trip.days || []).map((day) => (
                <div key={day.dayNumber} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Day {day.dayNumber}: {day.title}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{day.date}</span>
                  </div>

                  {(!day.activities || day.activities.length === 0) ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No activities scheduled.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {day.activities.map((act) => (
                        <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>{act.time}</span>
                            <span>{act.title}</span>
                            {act.location && <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({act.location})</span>}
                          </div>
                          {act.cost > 0 && <span style={{ fontWeight: 600 }}>${act.cost}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Packing Overview */}
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Packing Essentials ({(trip.packingList || []).filter(p => p.packed).length}/{(trip.packingList || []).length} packed)
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(trip.packingList || []).map((p) => (
                  <span key={p.id} style={{
                    fontSize: '0.78rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    background: p.packed ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: p.packed ? 'var(--accent-emerald)' : 'var(--text-secondary)'
                  }}>
                    {p.packed ? '✓ ' : '○ '}{p.item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopyJSON}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleDownloadJSON}>
              <Download size={14} />
              <span>Download File</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
