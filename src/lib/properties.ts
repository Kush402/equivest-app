export interface Property {
  id: string;
  name: string;
  city: string;
  state: string;
  type: 'Multifamily' | 'Commercial' | 'Mixed-Use' | 'Single Family';
  image: string;
  price: number;
  tokenPrice: number;
  yield: number;
  appreciation: number;
  totalReturn: number;
  funded: number;         // percentage 0-100
  investors: number;
  beds?: number;
  baths?: number;
  sqft: number;
  yearBuilt: number;
  occupancy: number;
  monthlyRent: number;
  description: string;
  highlights: string[];
  tags: string[];
  status: 'Funding' | 'Funded' | 'Coming Soon';
  minInvestment: number;
  marketCap: number;
  holdPeriod: string;
}

export const properties: Property[] = [
  {
    id: 'highland-tower',
    name: 'Highland Tower',
    city: 'Boston',
    state: 'MA',
    type: 'Multifamily',
    image: '/images/prop1.png',
    price: 4_200_000,
    tokenPrice: 50,
    yield: 7.4,
    appreciation: 4.2,
    totalReturn: 11.6,
    funded: 78,
    investors: 312,
    beds: 84,
    baths: 84,
    sqft: 68_400,
    yearBuilt: 2019,
    occupancy: 96,
    monthlyRent: 26_300,
    description: 'Class-A multifamily tower in Boston\'s thriving Seaport District. Fully renovated with premium amenities including rooftop pool, concierge, and co-working spaces. Strong rental demand driven by biotech and finance sectors.',
    highlights: [
      'Rooftop infinity pool & lounge',
      'Electric vehicle charging stations',
      'Smart home automation in all units',
      'Walking distance to MBTA Red Line',
      'On-site fitness center & co-working',
    ],
    tags: ['High Yield', 'Prime Location', 'New Build'],
    status: 'Funding',
    minInvestment: 50,
    marketCap: 4_200_000,
    holdPeriod: '3–7 years',
  },
  {
    id: 'azure-bay-residences',
    name: 'Azure Bay Residences',
    city: 'Miami',
    state: 'FL',
    type: 'Multifamily',
    image: '/images/prop2.png',
    price: 8_750_000,
    tokenPrice: 50,
    yield: 6.8,
    appreciation: 5.9,
    totalReturn: 12.7,
    funded: 92,
    investors: 648,
    beds: 210,
    baths: 210,
    sqft: 220_000,
    yearBuilt: 2021,
    occupancy: 98,
    monthlyRent: 49_500,
    description: 'Waterfront luxury complex in Brickell, Miami\'s financial hub. Two towers connected by resort-style amenities. Near the Brickell City Centre and top-rated schools. High appreciation driven by Miami\'s booming economy.',
    highlights: [
      'Direct bayfront access with private marina',
      'Resort-style pool with cabanas',
      'Tennis & pickleball courts',
      'Concierge & valet services',
      '98% occupancy rate sustained',
    ],
    tags: ['Waterfront', 'Almost Funded', 'Top Performer'],
    status: 'Funding',
    minInvestment: 50,
    marketCap: 8_750_000,
    holdPeriod: '5–10 years',
  },
  {
    id: 'centrepoint-plaza',
    name: 'Centrepoint Plaza',
    city: 'Chicago',
    state: 'IL',
    type: 'Mixed-Use',
    image: '/images/prop3.png',
    price: 6_100_000,
    tokenPrice: 50,
    yield: 8.1,
    appreciation: 3.5,
    totalReturn: 11.6,
    funded: 55,
    investors: 204,
    sqft: 95_000,
    yearBuilt: 2018,
    occupancy: 89,
    monthlyRent: 41_200,
    description: 'Premier mixed-use development in Chicago\'s River North, featuring ground-floor retail anchored by national tenants and 120 luxury apartments above. Dual income streams provide resilience and consistent yield.',
    highlights: [
      'Anchored by Fortune-500 retail tenants',
      'Dual income: residential + commercial',
      'River North — highest foot-traffic district',
      'Recently updated HVAC & mechanical',
      'EV-ready parking structure',
    ],
    tags: ['Mixed-Use', 'High Yield', 'Dual Income'],
    status: 'Funding',
    minInvestment: 50,
    marketCap: 6_100_000,
    holdPeriod: '4–8 years',
  },
  {
    id: 'meridian-flats',
    name: 'Meridian Flats',
    city: 'Austin',
    state: 'TX',
    type: 'Multifamily',
    image: '/images/prop4.png',
    price: 3_350_000,
    tokenPrice: 50,
    yield: 8.9,
    appreciation: 6.1,
    totalReturn: 15.0,
    funded: 34,
    investors: 127,
    beds: 64,
    baths: 64,
    sqft: 52_000,
    yearBuilt: 2022,
    occupancy: 94,
    monthlyRent: 24_800,
    description: 'Brand new Class-A apartments in East Austin, one of the fastest-growing neighborhoods in the country. Targeted at tech professionals relocating to Austin from higher-cost metros. Strong rent growth expected.',
    highlights: [
      'Walking distance to major tech campuses',
      'Fast-growing East Austin submarket',
      'Premium finishes: quartz, hardwood, SS appliances',
      '6.1% projected appreciation',
      'Pet-friendly with dog park',
    ],
    tags: ['Highest Return', 'New Build', 'Tech Hub'],
    status: 'Funding',
    minInvestment: 50,
    marketCap: 3_350_000,
    holdPeriod: '3–5 years',
  },
  {
    id: 'the-nashville-collective',
    name: 'The Nashville Collective',
    city: 'Nashville',
    state: 'TN',
    type: 'Mixed-Use',
    image: '/images/prop5.png',
    price: 5_480_000,
    tokenPrice: 50,
    yield: 7.7,
    appreciation: 4.8,
    totalReturn: 12.5,
    funded: 100,
    investors: 521,
    sqft: 78_000,
    yearBuilt: 2020,
    occupancy: 97,
    monthlyRent: 35_100,
    description: 'Fully funded mixed-use community in The Gulch, Nashville\'s trendiest neighborhood. 96 apartments above chef-driven restaurants and boutique retail. Consistent distribution history with 99.3% on-time payments.',
    highlights: [
      'Fully funded — now generating returns',
      '97% long-term occupancy record',
      'Gulch neighborhood — highest demand',
      'Consistent quarterly distributions',
      '2 Michelin-starred restaurant anchor',
    ],
    tags: ['Fully Funded', 'Stable Returns'],
    status: 'Funded',
    minInvestment: 50,
    marketCap: 5_480_000,
    holdPeriod: '5–7 years',
  },
  {
    id: 'pacific-grove-commons',
    name: 'Pacific Grove Commons',
    city: 'San Diego',
    state: 'CA',
    type: 'Multifamily',
    image: '/images/prop1.png',
    price: 9_200_000,
    tokenPrice: 50,
    yield: 5.9,
    appreciation: 7.2,
    totalReturn: 13.1,
    funded: 0,
    investors: 0,
    beds: 144,
    baths: 144,
    sqft: 142_000,
    yearBuilt: 2023,
    occupancy: 0,
    monthlyRent: 45_000,
    description: 'Coming soon — a premium coastal multifamily development in San Diego\'s Pacific Beach. Proximity to biotech corridor and UC San Diego drives exceptional rental demand. Join the waitlist.',
    highlights: [
      'Brand new 2023 construction',
      'Steps from Pacific Beach',
      'Biotech & UCSD demand driver',
      'Projected 7.2% annual appreciation',
      'Join waitlist for early access',
    ],
    tags: ['Coming Soon', 'Coastal', 'Waitlist'],
    status: 'Coming Soon',
    minInvestment: 50,
    marketCap: 9_200_000,
    holdPeriod: '5–10 years',
  },
];

export function getProperty(id: string): Property | undefined {
  return properties.find(p => p.id === id);
}

export function formatCurrency(n: number, compact = false): string {
  if (compact) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
