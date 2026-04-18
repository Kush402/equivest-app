export interface ActivityEntry {
  id: string;
  initials: string;
  name: string;
  location: string;
  propertyName: string;
  propertyId: string;
  amount: number;
  secondsAgo: number;
  avatarColor: string;
}

const BASE_ACTIVITIES: Omit<ActivityEntry, 'id' | 'secondsAgo'>[] = [
  { initials: 'AK', name: 'Arjun K.', location: 'San Francisco, CA', propertyName: 'Highland Tower', propertyId: 'highland-tower', amount: 250, avatarColor: 'from-violet-500 to-purple-600' },
  { initials: 'SR', name: 'Sofia R.', location: 'New York, NY', propertyName: 'Azure Bay', propertyId: 'azure-bay-residences', amount: 500, avatarColor: 'from-blue-500 to-cyan-500' },
  { initials: 'MT', name: 'Marcus T.', location: 'Austin, TX', propertyName: 'Meridian Flats', propertyId: 'meridian-flats', amount: 150, avatarColor: 'from-emerald-500 to-teal-500' },
  { initials: 'LW', name: 'Lily W.', location: 'Chicago, IL', propertyName: 'Centrepoint Plaza', propertyId: 'centrepoint-plaza', amount: 1000, avatarColor: 'from-amber-500 to-orange-500' },
  { initials: 'JP', name: 'James P.', location: 'Miami, FL', propertyName: 'Azure Bay', propertyId: 'azure-bay-residences', amount: 350, avatarColor: 'from-pink-500 to-rose-500' },
  { initials: 'NB', name: 'Nadia B.', location: 'Seattle, WA', propertyName: 'Highland Tower', propertyId: 'highland-tower', amount: 200, avatarColor: 'from-indigo-500 to-blue-600' },
  { initials: 'CL', name: 'Chen L.', location: 'Boston, MA', propertyName: 'Meridian Flats', propertyId: 'meridian-flats', amount: 750, avatarColor: 'from-teal-500 to-green-500' },
  { initials: 'EM', name: 'Elena M.', location: 'Denver, CO', propertyName: 'Centrepoint Plaza', propertyId: 'centrepoint-plaza', amount: 100, avatarColor: 'from-red-500 to-pink-500' },
  { initials: 'RJ', name: 'Raj J.', location: 'Houston, TX', propertyName: 'Highland Tower', propertyId: 'highland-tower', amount: 450, avatarColor: 'from-yellow-500 to-amber-500' },
  { initials: 'ZA', name: 'Zara A.', location: 'Los Angeles, CA', propertyName: 'Azure Bay', propertyId: 'azure-bay-residences', amount: 2000, avatarColor: 'from-purple-500 to-pink-500' },
];

let _counter = 0;

export function generateActivity(): ActivityEntry {
  const base = BASE_ACTIVITIES[_counter % BASE_ACTIVITIES.length];
  _counter++;
  return {
    ...base,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    secondsAgo: Math.floor(Math.random() * 55) + 5,
  };
}

export function getInitialActivities(count = 6): ActivityEntry[] {
  const activities: ActivityEntry[] = [];
  for (let i = 0; i < count; i++) {
    const base = BASE_ACTIVITIES[i % BASE_ACTIVITIES.length];
    activities.push({
      ...base,
      id: `init-${i}`,
      secondsAgo: (i + 1) * 14 + Math.floor(Math.random() * 30),
    });
  }
  return activities;
}

export function formatTimeAgo(secondsAgo: number): string {
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  return `${Math.floor(secondsAgo / 3600)}h ago`;
}
