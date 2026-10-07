const { readJSON } = require('./storage');

// Standard activity banks for dynamic generation when destination is not strictly in presets
const ACTIVITY_BANK = {
  Culture: [
    { title: "Historic District Heritage Walk", time: "09:30", cost: 0, notes: "Discover centuries of architectural heritage and local culture." },
    { title: "National Heritage Museum & Gallery", time: "11:00", cost: 18, notes: "Explore landmark artifacts, sculptures, and royal collections." },
    { title: "Sacred Temple / Cathedral Visit", time: "14:30", cost: 8, notes: "Marvel at sacred stained glass, gilded altars, and quiet courtyards." }
  ],
  Sightseeing: [
    { title: "Panoramic City Viewpoint & Skydeck", time: "10:00", cost: 22, notes: "Sweeping 360-degree views of the entire metropolis and skyline." },
    { title: "Iconic Central Monument & Plaza", time: "15:00", cost: 0, notes: "Prime photo opportunity at the city's most recognized landmark." },
    { title: "Waterfront Harbor / River Promenade Stroll", time: "17:30", cost: 0, notes: "Catch the golden hour light reflecting across the water." }
  ],
  Dining: [
    { title: "Artisan Bakery & Morning Roast Coffee", time: "08:30", cost: 12, notes: "Warm fresh pastries and locally roasted espresso." },
    { title: "Historic Street Food Market Tasting", time: "12:30", cost: 20, notes: "Sample regional signature dishes, skewers, and sweet treats." },
    { title: "Chef's Table Regional Bistro Dinner", time: "19:30", cost: 45, notes: "Indulge in seasonal culinary specialties and wine pairings." }
  ],
  Nature: [
    { title: "Botanical Gardens & Tropical Conservatory", time: "09:30", cost: 10, notes: "Serene walking paths surrounded by exotic flora and lily ponds." },
    { title: "Scenic Coastal / Mountain Trail Hike", time: "14:00", cost: 0, notes: "Brisk outdoor trek offering panoramic valley and ocean vistas." },
    { title: "Sunset Beach / Lakefront Relaxation", time: "18:00", cost: 0, notes: "Unwind by the shoreline as twilight settles over the horizon." }
  ],
  "Art & Museums": [
    { title: "Contemporary Art Pavilion & Installations", time: "10:30", cost: 20, notes: "Cutting-edge modern exhibitions, kinetic art, and photography." },
    { title: "Artisan Workshop & Craft Studio", time: "14:00", cost: 25, notes: "Watch master craftspeople creating pottery, glass, or textiles." }
  ],
  Shopping: [
    { title: "Chic Boutiques & Design Arcade", time: "15:30", cost: 0, notes: "Browse handcrafted fashion, jewelry, and unique souvenirs." },
    { title: "Vibrant Night Bazaar Exploration", time: "20:00", cost: 0, notes: "Vibrant stalls selling gifts, spices, and street delicacies." }
  ]
};

function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 3;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(diffDays, 1), 14); // Between 1 and 14 days
}

function formatDate(startDate, dayIndex) {
  const date = new Date(startDate || Date.now());
  date.setDate(date.getDate() + dayIndex);
  return date.toISOString().split('T')[0];
}

function generateSmartItinerary({ destination, startDate, endDate, travelStyle, budget, interests = [] }) {
  const destinations = readJSON('destinations.json', []);
  const matchingDest = destinations.find(
    d => d.name.toLowerCase() === (destination || '').toLowerCase() ||
         d.id.toLowerCase().includes((destination || '').toLowerCase())
  );

  const numDays = calculateDays(startDate, endDate);
  const days = [];
  const baseLat = matchingDest ? matchingDest.lat : 48.8566;
  const baseLng = matchingDest ? matchingDest.lng : 2.3522;
  const attractions = matchingDest ? [...matchingDest.attractions] : [];

  const dayThemes = [
    "Arrival & Signature Highlights",
    "Deep Dive into Culture & Architecture",
    "Culinary Gems & Scenic Landscapes",
    "Artistic Havens & Local Neighborhoods",
    "Vibrant Markets & Sunset Vistas",
    "Hidden Escapes & Nature Trails",
    "Grand Farewell & Leisurely Souvenirs"
  ];

  for (let i = 0; i < numDays; i++) {
    const dayNumber = i + 1;
    const date = formatDate(startDate, i);
    const dayTitle = dayThemes[i % dayThemes.length];
    const activities = [];

    // Morning Activity
    if (attractions.length > 0 && i < attractions.length) {
      const attr = attractions[i];
      activities.push({
        id: `gen-act-${i}-1`,
        time: "09:30",
        title: attr.name,
        category: attr.category || "Sightseeing",
        location: `${attr.name}, ${matchingDest ? matchingDest.name : destination}`,
        lat: attr.lat || (baseLat + (Math.random() - 0.5) * 0.04),
        lng: attr.lng || (baseLng + (Math.random() - 0.5) * 0.04),
        cost: attr.cost || 0,
        notes: attr.description,
        completed: false
      });
    } else {
      const culturePick = ACTIVITY_BANK.Culture[i % ACTIVITY_BANK.Culture.length];
      activities.push({
        id: `gen-act-${i}-1`,
        time: culturePick.time,
        title: `${destination}: ${culturePick.title}`,
        category: "Culture",
        location: `${destination} Central District`,
        lat: baseLat + (Math.random() - 0.5) * 0.03,
        lng: baseLng + (Math.random() - 0.5) * 0.03,
        cost: culturePick.cost,
        notes: culturePick.notes,
        completed: false
      });
    }

    // Lunch / Dining Activity
    const diningPick = ACTIVITY_BANK.Dining[(i + 1) % ACTIVITY_BANK.Dining.length];
    activities.push({
      id: `gen-act-${i}-2`,
      time: "12:45",
      title: `${diningPick.title}`,
      category: "Dining",
      location: `${destination} Gourmet Quarter`,
      lat: baseLat + (Math.random() - 0.5) * 0.02,
      lng: baseLng + (Math.random() - 0.5) * 0.02,
      cost: diningPick.cost,
      notes: matchingDest && matchingDest.foodSpecialties ? `Try local specialty: ${matchingDest.foodSpecialties[i % matchingDest.foodSpecialties.length]}` : diningPick.notes,
      completed: false
    });

    // Afternoon / Evening Activity
    const afternoonCategory = (interests.length > 0 && interests[i % interests.length]) || (i % 2 === 0 ? "Nature" : "Sightseeing");
    const bank = ACTIVITY_BANK[afternoonCategory] || ACTIVITY_BANK.Sightseeing;
    const afternoonPick = bank[i % bank.length];

    activities.push({
      id: `gen-act-${i}-3`,
      time: "16:00",
      title: `${afternoonPick.title}`,
      category: afternoonCategory,
      location: `${destination} Panorama Point`,
      lat: baseLat + (Math.random() - 0.5) * 0.04,
      lng: baseLng + (Math.random() - 0.5) * 0.04,
      cost: afternoonPick.cost,
      notes: afternoonPick.notes,
      completed: false
    });

    days.push({
      dayNumber,
      date,
      title: dayTitle,
      activities
    });
  }

  // Generate smart packing list
  const packingTemplates = readJSON('packingTemplates.json', { baseEssentials: [], climateSpecific: {} });
  const climate = matchingDest ? matchingDest.climate : "Temperate";
  const climateItems = packingTemplates.climateSpecific[climate] || packingTemplates.climateSpecific.Temperate || [];
  
  const packingList = [
    ...packingTemplates.baseEssentials.map((item, idx) => ({
      id: `smart-pack-base-${idx}`,
      category: item.category,
      item: item.item,
      packed: false,
      essential: item.essential
    })),
    ...climateItems.map((item, idx) => ({
      id: `smart-pack-clim-${idx}`,
      category: item.category,
      item: item.item,
      packed: false,
      essential: item.essential
    }))
  ];

  return {
    days,
    packingList,
    meta: {
      climate,
      estimatedBudget: budget || (matchingDest ? matchingDest.averageDailyCost * numDays : 150 * numDays),
      currency: matchingDest ? matchingDest.currency : "USD",
      coverImage: matchingDest ? matchingDest.coverImage : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
      country: matchingDest ? matchingDest.country : "",
      flag: matchingDest ? matchingDest.flag : "✈️"
    }
  };
}

module.exports = {
  generateSmartItinerary
};
