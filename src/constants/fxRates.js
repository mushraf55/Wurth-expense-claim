// Supported currencies and their exchange rates to AED
// Source: WPS Finance — update these rates as market conditions change
export const FX_RATES = {
  EUR: 4.01,
  USD: 3.67,
  TL: 0.12,
  CNY: 0.52,
  AED: 1
};

// Human-readable FX rate text for display (e.g., "1 EUR = 4.01 AED")
export const getRateText = (currency) => {
  const rate = FX_RATES[currency];
  if (!rate) return 'Local (1 AED = 1 AED)';
  if (currency === 'AED') return 'Local (1 AED = 1 AED)';
  return `1 ${currency} = ${rate.toFixed(2)} AED`;
};

// Get the currency symbol for a given currency code
export const getCurrencySymbol = (currency) => {
  const symbols = {
    EUR: '€',
    USD: '$',
    TL: '₺',
    CNY: '¥',
    AED: 'AED'
  };
  return symbols[currency] || currency;
};

// Format currency as: "€ EUR 100.00" (symbol + code + amount)
export const formatCurrencyDisplay = (currency, amount) => {
  const symbol = getCurrencySymbol(currency);
  const code = currency || '';
  const formattedAmount = parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
  return `${symbol} ${code} ${formattedAmount}`;
};

// Supported currency codes for dropdown menus
export const SUPPORTED_CURRENCIES = Object.keys(FX_RATES);
