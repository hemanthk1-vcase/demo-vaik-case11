export const CURRENCY_SYMBOL = { USD: '$', GBP: '£', INR: '₹' };

export const COUNTRY_LABEL = {
  united_states: 'United States',
  united_kingdom: 'United Kingdom',
  india: 'India'
};

export const COUNTRY_DATE_FORMAT = {
  united_states: 'MM/DD/YYYY',
  united_kingdom: 'DD/MM/YYYY',
  india: 'DD/MM/YYYY'
};

export function formatDate(value, country) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return country === 'united_states' ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
}

export function formatCurrency(amount, currency) {
  const sym = CURRENCY_SYMBOL[currency] || '$';
  if (amount == null || amount === '') return '—';
  const n = Number(amount);
  if (isNaN(n)) return '—';
  return `${sym}${n.toLocaleString('en-US')}`;
}