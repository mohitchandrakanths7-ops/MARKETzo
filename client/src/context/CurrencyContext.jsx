import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';

const DEFAULT_RATES = {
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
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currency: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', symbol: '﷼', locale: 'ar-SA' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: 'S$', locale: 'en-SG' },
  { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', symbol: '¥', locale: 'zh-CN' }
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', countryCode: 'IN', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', countryCode: 'US', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', countryCode: 'EU', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', countryCode: 'GB', locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪', countryCode: 'AE', locale: 'ar-AE' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', countryCode: 'CA', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', countryCode: 'AU', locale: 'en-AU' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', countryCode: 'JP', locale: 'ja-JP' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', countryCode: 'SG', locale: 'en-SG' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦', countryCode: 'SA', locale: 'ar-SA' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', countryCode: 'CN', locale: 'zh-CN' }
];

const detectUserCountryAndCurrency = () => {
  try {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
    const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();

    // India detection
    if (tz.includes('calcutta') || tz.includes('kolkata') || tz.includes('india') || lang.includes('en-in') || lang.includes('hi') || lang.includes('ta') || lang.includes('te') || lang.includes('mr') || lang.includes('gu')) {
      return { countryCode: 'IN', currencyCode: 'INR' };
    }

    // UK detection
    if (tz.includes('london') || lang.includes('en-gb')) {
      return { countryCode: 'GB', currencyCode: 'GBP' };
    }

    // Japan detection
    if (tz.includes('tokyo') || lang.includes('ja')) {
      return { countryCode: 'JP', currencyCode: 'JPY' };
    }

    // UAE detection
    if (tz.includes('dubai') || lang.includes('ar-ae')) {
      return { countryCode: 'AE', currencyCode: 'AED' };
    }

    // Saudi Arabia detection
    if (tz.includes('riyadh') || lang.includes('ar-sa')) {
      return { countryCode: 'SA', currencyCode: 'SAR' };
    }

    // Canada detection
    if (tz.includes('toronto') || tz.includes('vancouver') || tz.includes('montreal') || lang.includes('en-ca') || lang.includes('fr-ca')) {
      return { countryCode: 'CA', currencyCode: 'CAD' };
    }

    // Australia detection
    if (tz.includes('sydney') || tz.includes('melbourne') || tz.includes('brisbane') || tz.includes('perth') || lang.includes('en-au')) {
      return { countryCode: 'AU', currencyCode: 'AUD' };
    }

    // Singapore detection
    if (tz.includes('singapore') || lang.includes('en-sg') || lang.includes('zh-sg')) {
      return { countryCode: 'SG', currencyCode: 'SGD' };
    }

    // China detection
    if (tz.includes('shanghai') || tz.includes('beijing') || lang.includes('zh-cn')) {
      return { countryCode: 'CN', currencyCode: 'CNY' };
    }

    // Eurozone detection
    if (tz.includes('paris') || tz.includes('berlin') || tz.includes('rome') || tz.includes('madrid') || tz.includes('amsterdam') || tz.includes('vienna') || tz.includes('europe/')) {
      return { countryCode: 'EU', currencyCode: 'EUR' };
    }

    // USA detection
    if (tz.includes('new_york') || tz.includes('chicago') || tz.includes('los_angeles') || tz.includes('denver') || lang.includes('en-us')) {
      return { countryCode: 'US', currencyCode: 'USD' };
    }

    // Default to India for this marketplace deployment priority
    return { countryCode: 'IN', currencyCode: 'INR' };
  } catch (err) {
    return { countryCode: 'IN', currencyCode: 'INR' };
  }
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [isAuto, setIsAuto] = useState(() => {
    const savedMode = localStorage.getItem('marketzo_currency_mode');
    return savedMode !== 'manual';
  });

  const [currentCurrency, setCurrentCurrency] = useState(() => {
    const savedMode = localStorage.getItem('marketzo_currency_mode');
    const savedCurrency = localStorage.getItem('marketzo_currency');
    if (savedMode === 'manual' && savedCurrency && DEFAULT_RATES[savedCurrency]) {
      return savedCurrency;
    }
    const detected = detectUserCountryAndCurrency();
    return detected.currencyCode;
  });

  const detectedInfo = useMemo(() => detectUserCountryAndCurrency(), []);

  // Fetch live exchange rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/currency/rates').then(r => r.json());
        if (res.success && res.rates) {
          setRates(prev => ({ ...prev, ...res.rates }));
        }
      } catch (err) {
        // Graceful fallback to DEFAULT_RATES
      }
    };
    fetchRates();
  }, []);

  // Active currency details
  const activeCurrencyInfo = useMemo(() => {
    return CURRENCIES.find(c => c.code === currentCurrency) || CURRENCIES[0];
  }, [currentCurrency]);

  const activeCountryInfo = useMemo(() => {
    return COUNTRIES.find(c => c.currency === currentCurrency) || COUNTRIES[0];
  }, [currentCurrency]);

  // Set manual currency
  const setCurrency = (code) => {
    if (!DEFAULT_RATES[code]) return;
    setIsAuto(false);
    setCurrentCurrency(code);
    localStorage.setItem('marketzo_currency_mode', 'manual');
    localStorage.setItem('marketzo_currency', code);
  };

  // Set automatic location detection
  const setAutoDetection = () => {
    setIsAuto(true);
    const detected = detectUserCountryAndCurrency();
    setCurrentCurrency(detected.currencyCode);
    localStorage.setItem('marketzo_currency_mode', 'auto');
    localStorage.removeItem('marketzo_currency');
  };

  // Convert USD numeric amount to active currency numeric amount
  const convert = (amountInUSD, targetCurrency = currentCurrency) => {
    if (amountInUSD === null || amountInUSD === undefined || isNaN(amountInUSD)) return 0;
    const rate = rates[targetCurrency] || 1.0;
    return parseFloat((parseFloat(amountInUSD) * rate).toFixed(2));
  };

  // Format USD amount to localized formatted currency string using Intl.NumberFormat
  const formatPrice = (amountInUSD, customCurrency = null) => {
    if (amountInUSD === null || amountInUSD === undefined || isNaN(amountInUSD)) {
      amountInUSD = 0;
    }
    const curr = customCurrency || currentCurrency;
    const rate = rates[curr] || 1.0;
    const converted = parseFloat(amountInUSD) * rate;
    const currInfo = CURRENCIES.find(c => c.code === curr) || { locale: 'en-US', code: 'USD' };

    try {
      return new Intl.NumberFormat(currInfo.locale || 'en-US', {
        style: 'currency',
        currency: curr,
        maximumFractionDigits: curr === 'JPY' ? 0 : 2,
        minimumFractionDigits: curr === 'JPY' ? 0 : (converted % 1 === 0 ? 0 : 2)
      }).format(converted);
    } catch (err) {
      // Fallback
      return `${currInfo.symbol || '$'}${converted.toLocaleString()}`;
    }
  };

  const value = {
    currentCurrency,
    activeCurrencyInfo,
    activeCountryInfo,
    isAuto,
    rates,
    currencies: CURRENCIES,
    countries: COUNTRIES,
    detectedInfo,
    setCurrency,
    setAutoDetection,
    convert,
    formatPrice
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
