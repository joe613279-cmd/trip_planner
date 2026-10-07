import React, { useState } from 'react';
import { Check, Plus, Trash2, Sparkles, CheckSquare, ShieldAlert, Tag } from 'lucide-react';
import { useTrips } from '../context/TripContext';

const PACKING_CATEGORIES = ['Documents', 'Clothing', 'Electronics', 'Toiletries', 'Essentials'];

export default function PackingList({ trip }) {
  const { togglePackingItem, addPackingItem, deletePackingItem, regeneratePacking } = useTrips();
  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState('Essentials');
  const [isEssential, setIsEssential] = useState(false);

  const items = trip?.packingList || [];
  const total = items.length;
  const packedCount = items.filter(i => i.packed).length;
  const percentPacked = total > 0 ? Math.round((packedCount / total) * 100) : 0;

  // Group items by category
  const categories = {};
  items.forEach(it => {
    const cat = it.category || 'General';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(it);
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addPackingItem(trip.id, {
      item: newItemName.trim(),
      category: newCategory,
      essential: isEssential
    });

    setNewItemName('');
    setIsEssential(false);
  };

  return (
    <div className="packing-container">
      {/* Left Column: Progress & Add Item Form */}
      <aside className="packing-summary-sidebar">
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Packing Assistant
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Weather & climate-aware gear list
          </p>
        </div>

        {/* Progress Card */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Packed Readiness</span>
            <span style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontSize: '1rem' }}>
              {percentPacked}%
            </span>
          </div>

          <div className="trip-progress-bar" style={{ height: '8px', marginBottom: '0.5rem' }}>
            <div 
              className="trip-progress-fill" 
              style={{ width: `${percentPacked}%`, background: 'var(--accent-emerald)' }} 
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {packedCount} of {total} items ready
          </div>
        </div>

        {/* Regenerate with AI Button */}
        <button
          className="btn btn-outline"
          onClick={() => {
            if (window.confirm('Regenerate smart packing checklist based on destination climate?')) {
              regeneratePacking(trip.id);
            }
          }}
          style={{ width: '100%' }}
        >
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          <span>Regenerate Smart List</span>
        </button>

        {/* Add Custom Item Form */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Add Custom Item</h4>
          <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="e.g. Noise-canceling headphones"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              required
            />

            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              {PACKING_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isEssential}
                onChange={(e) => setIsEssential(e.target.checked)}
              />
              <span>Mark as Essential</span>
            </label>

            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={14} />
              <span>Add to List</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Right Column: Categorized Checklists */}
      <main className="packing-categories-pane">
        {Object.keys(categories).length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No packing items yet. Click "Regenerate Smart List" to auto-populate!</p>
          </div>
        ) : (
          Object.entries(categories).map(([category, catItems]) => (
            <div key={category} className="packing-category-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={16} style={{ color: 'var(--primary)' }} />
                  {category}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {catItems.filter(i => i.packed).length}/{catItems.length} packed
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {catItems.map((item) => (
                  <div key={item.id} className="packing-item-row">
                    <div 
                      className="packing-item-left"
                      onClick={() => togglePackingItem(trip.id, item.id, !item.packed)}
                    >
                      <div className={`custom-checkbox ${item.packed ? 'checked' : ''}`}>
                        {item.packed && <Check size={14} strokeWidth={3} />}
                      </div>

                      <span style={{
                        fontSize: '0.92rem',
                        textDecoration: item.packed ? 'line-through' : 'none',
                        color: item.packed ? 'var(--text-muted)' : 'var(--text-primary)',
                        fontWeight: item.essential ? 600 : 400
                      }}>
                        {item.item}
                      </span>

                      {item.essential && (
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(244, 63, 94, 0.15)',
                          color: 'var(--accent-coral)',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          Essential
                        </span>
                      )}
                    </div>

                    <button
                      className="btn-icon btn-sm"
                      onClick={() => deletePackingItem(trip.id, item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={13} style={{ color: 'var(--accent-coral)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
