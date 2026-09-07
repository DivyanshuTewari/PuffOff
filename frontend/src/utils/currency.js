export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
};

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export function getCurrencySymbol(code) {
  if (!code) return '₹';
  return CURRENCY_SYMBOLS[code.toUpperCase()] || code;
}

export function formatCurrency(amount, code = 'INR') {
  const symbol = getCurrencySymbol(code);
  const num = Number(amount) || 0;
  return `${symbol}${num.toFixed(2)}`;
}
