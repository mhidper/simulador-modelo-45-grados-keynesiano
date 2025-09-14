
export interface EconomicParams {
  c0: number; // Autonomous Consumption
  c1: number; // Marginal Propensity to Consume
  I: number;  // Investment
  G: number;  // Government Spending
  T: number;  // Taxes
}

export interface ChartData {
  y_val: number;
  z_line: number;
  forty_five_line: number;
  z_prime_line: number | null;
}
