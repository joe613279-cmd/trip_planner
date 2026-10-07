import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const TripContext = createContext();

export function TripProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getTrips();
      if (res.success) {
        setTrips(res.data);
        return res.data;
      }
    } catch (err) {
      showToast('Failed to load trips from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadTripDetails = useCallback(async (tripId) => {
    try {
      setLoading(true);
      const res = await api.getTrip(tripId);
      if (res.success) {
        setActiveTrip(res.data);
        return res.data;
      }
    } catch (err) {
      showToast('Error loading trip details', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const createTrip = async (tripData) => {
    try {
      const res = await api.createTrip(tripData);
      if (res.success) {
        showToast(`Trip to ${res.data.destination} created!`);
        await loadTrips();
        setActiveTrip(res.data);
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to create trip', 'error');
      throw err;
    }
  };

  const updateTrip = async (id, tripData) => {
    try {
      const res = await api.updateTrip(id, tripData);
      if (res.success) {
        showToast('Trip updated successfully');
        setActiveTrip(res.data);
        await loadTrips();
        return res.data;
      }
    } catch (err) {
      showToast(err.message || 'Failed to update trip', 'error');
      throw err;
    }
  };

  const deleteTrip = async (id) => {
    try {
      const res = await api.deleteTrip(id);
      if (res.success) {
        showToast('Trip deleted');
        if (activeTrip && activeTrip.id === id) {
          setActiveTrip(null);
        }
        await loadTrips();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete trip', 'error');
      throw err;
    }
  };

  const addDay = async (tripId, dayData) => {
    try {
      const res = await api.addDay(tripId, dayData);
      if (res.success) {
        showToast('New day added to itinerary');
        await loadTripDetails(tripId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add day', 'error');
    }
  };

  const deleteDay = async (tripId, dayNumber) => {
    try {
      const res = await api.deleteDay(tripId, dayNumber);
      if (res.success) {
        showToast(`Day ${dayNumber} removed`);
        await loadTripDetails(tripId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete day', 'error');
    }
  };

  const addActivity = async (tripId, actData) => {
    try {
      const res = await api.addActivity(tripId, actData);
      if (res.success) {
        showToast('Activity added');
        await loadTripDetails(tripId);
        await loadTrips();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add activity', 'error');
    }
  };

  const updateActivity = async (tripId, actId, actData) => {
    try {
      const res = await api.updateActivity(tripId, actId, actData);
      if (res.success) {
        showToast('Activity updated');
        await loadTripDetails(tripId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update activity', 'error');
    }
  };

  const deleteActivity = async (tripId, actId) => {
    try {
      const res = await api.deleteActivity(tripId, actId);
      if (res.success) {
        showToast('Activity removed');
        await loadTripDetails(tripId);
        await loadTrips();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete activity', 'error');
    }
  };

  const toggleActivityComplete = async (tripId, actId, completed) => {
    try {
      await api.updateActivity(tripId, actId, { completed });
      setActiveTrip(prev => {
        if (!prev) return prev;
        const newDays = prev.days.map(d => ({
          ...d,
          activities: d.activities.map(a => a.id === actId ? { ...a, completed } : a)
        }));
        return { ...prev, days: newDays };
      });
      await loadTrips();
    } catch (err) {
      showToast('Could not update status', 'error');
    }
  };

  const addExpense = async (tripId, expData) => {
    try {
      const res = await api.addExpense(tripId, expData);
      if (res.success) {
        showToast('Expense recorded');
        await loadTripDetails(tripId);
        await loadTrips();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add expense', 'error');
    }
  };

  const deleteExpense = async (tripId, expId) => {
    try {
      const res = await api.deleteExpense(tripId, expId);
      if (res.success) {
        showToast('Expense removed');
        await loadTripDetails(tripId);
        await loadTrips();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  const togglePackingItem = async (tripId, itemId, packed) => {
    try {
      await api.updatePackingItem(tripId, itemId, { packed });
      setActiveTrip(prev => {
        if (!prev) return prev;
        const newPacking = (prev.packingList || []).map(p => p.id === itemId ? { ...p, packed } : p);
        return { ...prev, packingList: newPacking };
      });
      await loadTrips();
    } catch (err) {
      showToast('Could not update packing item', 'error');
    }
  };

  const addPackingItem = async (tripId, itemData) => {
    try {
      const res = await api.addPackingItem(tripId, itemData);
      if (res.success) {
        showToast('Packing item added');
        await loadTripDetails(tripId);
        await loadTrips();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add packing item', 'error');
    }
  };

  const deletePackingItem = async (tripId, itemId) => {
    try {
      const res = await api.deletePackingItem(tripId, itemId);
      if (res.success) {
        showToast('Packing item removed');
        await loadTripDetails(tripId);
        await loadTrips();
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove packing item', 'error');
    }
  };

  const regeneratePacking = async (tripId) => {
    try {
      const res = await api.generatePacking(tripId);
      if (res.success) {
        showToast(`Smart checklist refreshed with ${res.count} items!`);
        await loadTripDetails(tripId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to regenerate packing list', 'error');
    }
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        setActiveTrip,
        loading,
        toast,
        showToast,
        loadTrips,
        loadTripDetails,
        createTrip,
        updateTrip,
        deleteTrip,
        addDay,
        deleteDay,
        addActivity,
        updateActivity,
        deleteActivity,
        toggleActivityComplete,
        addExpense,
        deleteExpense,
        togglePackingItem,
        addPackingItem,
        deletePackingItem,
        regeneratePacking
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrips must be used within a TripProvider');
  return context;
}
