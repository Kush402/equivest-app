export interface MonthlyDataPoint {
  month: string;
  income: number;
  expenses: number;
  netIncome: number;
  propertyValue?: number;
}

export interface PortfolioDataPoint {
  month: string;
  value: number;
  invested: number;
  roi: number;
}

export function generatePropertyFinancials(
  monthlyRent: number,
  propertyPrice: number,
  months = 12
): MonthlyDataPoint[] {
  const expenseRatio = 0.38; // typical multifamily expense ratio
  const baseExpenses = monthlyRent * expenseRatio;
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();

  return Array.from({ length: months }, (_, i) => {
    const idx = (now.getMonth() - (months - 1 - i) + 24) % 12;
    const seasonal = 1 + 0.03 * Math.sin((i / months) * Math.PI * 2);
    const randomVariance = 1 + (Math.random() - 0.5) * 0.04;
    const income = Math.round(monthlyRent * seasonal * randomVariance);
    const expenses = Math.round(baseExpenses * randomVariance);
    const appreciationFactor = Math.pow(1.005, i); // ~6% annual appreciation
    return {
      month: monthNames[idx],
      income,
      expenses,
      netIncome: income - expenses,
      propertyValue: Math.round(propertyPrice * appreciationFactor),
    };
  });
}

export function generatePortfolioHistory(months = 12): PortfolioDataPoint[] {
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  let value = 3200;
  const invested = 4000;

  return Array.from({ length: months }, (_, i) => {
    const idx = (now.getMonth() - (months - 1 - i) + 24) % 12;
    const growth = 1 + (0.008 + Math.random() * 0.005);
    value = Math.round(value * growth);
    return {
      month: monthNames[idx],
      value,
      invested,
      roi: parseFloat((((value - invested) / invested) * 100).toFixed(1)),
    };
  });
}

export interface FinancialBreakdown {
  grossRent: number;
  vacancy: number;
  managementFee: number;
  maintenance: number;
  insurance: number;
  taxes: number;
  netOperatingIncome: number;
  capRate: number;
}

export function getFinancialBreakdown(monthlyRent: number, propertyPrice: number): FinancialBreakdown {
  const grossRent = monthlyRent * 12;
  const vacancy = Math.round(grossRent * 0.04);
  const managementFee = Math.round(grossRent * 0.08);
  const maintenance = Math.round(grossRent * 0.12);
  const insurance = Math.round(grossRent * 0.04);
  const taxes = Math.round(grossRent * 0.10);
  const netOperatingIncome = grossRent - vacancy - managementFee - maintenance - insurance - taxes;
  const capRate = parseFloat(((netOperatingIncome / propertyPrice) * 100).toFixed(2));
  return { grossRent, vacancy, managementFee, maintenance, insurance, taxes, netOperatingIncome, capRate };
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskProfile {
  level: RiskLevel;
  score: number; // 1-10
  color: string;
  bgColor: string;
  explanation: string;
  factors: { label: string; positive: boolean }[];
}

export function getRiskProfile(occupancy: number, funded: number, yield_: number, yearBuilt: number): RiskProfile {
  let score = 5;
  if (occupancy >= 95) score -= 1.5;
  else if (occupancy < 85) score += 2;
  if (funded >= 80) score -= 1;
  if (yield_ > 9) score += 1.5;
  if (yearBuilt >= 2018) score -= 1;
  else if (yearBuilt < 2005) score += 1.5;
  score = Math.max(1, Math.min(10, score));

  const level: RiskLevel = score <= 3.5 ? 'Low' : score <= 6.5 ? 'Medium' : 'High';
  const riskMap = {
    Low:    { color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200' },
    Medium: { color: 'text-amber-600',   bgColor: 'bg-amber-50 border-amber-200'   },
    High:   { color: 'text-red-600',     bgColor: 'bg-red-50 border-red-200'       },
  };

  const explanations = {
    Low:    'This property shows strong fundamentals — high occupancy, institutional-grade tenants, and recent construction significantly reduce downside risk.',
    Medium: 'Moderate risk profile with solid income characteristics. Slight vacancy exposure and market timing introduce manageable variability.',
    High:   'Higher-yield opportunity with elevated risk. Older assets and market volatility could impact distributions. Suitable for risk-tolerant investors.',
  };

  return {
    level,
    score: parseFloat(score.toFixed(1)),
    ...riskMap[level],
    explanation: explanations[level],
    factors: [
      { label: `${occupancy}% occupancy`, positive: occupancy >= 92 },
      { label: `Built ${yearBuilt}`, positive: yearBuilt >= 2015 },
      { label: `${yield_}% yield`, positive: yield_ >= 7 },
      { label: `${funded}% funded`, positive: funded >= 60 },
    ],
  };
}
