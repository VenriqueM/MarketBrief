import type { Market } from '../types';

// Illustrative numbers only. Replace with a licensed, configured market data source before using as quotes.
export const markets: Market[] = [
  { name: 'S&P 500', symbol: 'SPX', value: '5,842.47', change: '+0.42%', positive: true },
  { name: 'Nasdaq Composite', symbol: 'IXIC', value: '18,392.76', change: '+0.68%', positive: true },
  { name: 'S&P/TSX Composite', symbol: 'GSPTSE', value: '25,184.32', change: '−0.16%', positive: false },
  { name: 'USD / CAD', symbol: 'USDCAD', value: '1.3924', change: '+0.08%', positive: true },
  { name: 'Gold', symbol: 'XAU', value: '$2,684.10', change: '+0.31%', positive: true },
  { name: 'Crude oil', symbol: 'WTI', value: '$71.86', change: '−0.54%', positive: false },
];
