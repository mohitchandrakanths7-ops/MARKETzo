const express = require('express');
const router = express.Router();

const EXCHANGE_RATES = {
  USD: 1.0,
  INR: 86.50,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 155.0,
  CNY: 7.23,
  AED: 3.67,
  SAR: 3.75,
  SGD: 1.35,
  BRL: 5.65,
  MXN: 19.50,
  CHF: 0.88,
  NZD: 1.68
};

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹', locale: 'en-IN' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'EU', name: 'European Union', flag: '🇪🇺', currency: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', symbol: 'C$', locale: 'en-CA' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', symbol: 'A$', locale: 'en-AU' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', symbol: '¥', locale: 'ja-JP' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', symbol: '﷼', locale: 'ar-SA' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: 'S$', locale: 'en-SG' },
  { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', symbol: '¥', locale: 'zh-CN' }
];

// Get Exchange Rates & Supported Currencies
router.get('/rates', (req, res) => {
  res.json({
    success: true,
    base: 'USD',
    rates: EXCHANGE_RATES,
    countries: COUNTRIES,
    updatedAt: new Date().toISOString()
  });
});

// Auto-detect country based on request headers / client info
router.get('/detect', (req, res) => {
  // Check cf-ipcountry or accept-language headers
  const countryHeader = req.headers['cf-ipcountry'] || req.headers['x-country-code'];
  const acceptLang = req.headers['accept-language'] || '';

  let detectedCountry = COUNTRIES.find(c => c.code === 'IN'); // Default to India for current region priority

  if (countryHeader) {
    const match = COUNTRIES.find(c => c.code.toUpperCase() === countryHeader.toUpperCase());
    if (match) detectedCountry = match;
  } else if (acceptLang.includes('en-GB') || acceptLang.includes('en-gb')) {
    detectedCountry = COUNTRIES.find(c => c.code === 'GB');
  } else if (acceptLang.includes('ja') || acceptLang.includes('JP')) {
    detectedCountry = COUNTRIES.find(c => c.code === 'JP');
  } else if (acceptLang.includes('en-CA') || acceptLang.includes('fr-CA')) {
    detectedCountry = COUNTRIES.find(c => c.code === 'CA');
  } else if (acceptLang.includes('en-AU')) {
    detectedCountry = COUNTRIES.find(c => c.code === 'AU');
  } else if (acceptLang.includes('de') || acceptLang.includes('fr') || acceptLang.includes('es') || acceptLang.includes('it')) {
    detectedCountry = COUNTRIES.find(c => c.code === 'EU');
  } else if (acceptLang.includes('ar-AE') || acceptLang.includes('ae')) {
    detectedCountry = COUNTRIES.find(c => c.code === 'AE');
  } else if (acceptLang.includes('en-US') && !acceptLang.includes('en-IN')) {
    detectedCountry = COUNTRIES.find(c => c.code === 'US');
  }

  res.json({
    success: true,
    detectedCountry,
    currency: detectedCountry.currency,
    rate: EXCHANGE_RATES[detectedCountry.currency] || 1.0,
    base: 'USD'
  });
});

module.exports = router;
