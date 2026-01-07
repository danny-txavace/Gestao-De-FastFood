import { FormatCountryRepository } from "../_repositories/FormattingValue/format-country-repository";
import { FormatCurrencyRepository } from "../_repositories/FormattingValue/format-currency-repository";

export function FormatQty(value: number | string | undefined | null): string {
  if (value === null || value === undefined || value === '') return '';

    let numberValue: number;

    if (typeof value === 'string') {
      const cleanedValue = value.replace(/\./g, '').replace(',', '.');
      numberValue = parseFloat(cleanedValue);
    } else {
      numberValue = value;
    }

    if (isNaN(numberValue)) return '';

    return numberValue.toFixed(0)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function FormatPercent(value: number | string | undefined | null): string {
  if (value === null || value === undefined || value === '') return '';

  let numberValue: number;

  if (typeof value === 'string') {
    const cleanedValue = value.replace(/\./g, '').replace(',', '.');
    numberValue = parseFloat(cleanedValue);
  } else {
    numberValue = value;
  }

  if (isNaN(numberValue)) return '';

  if (numberValue > 0)
  {
    return '+'+numberValue.toFixed(0)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')+' %';
  }
  else
  {
    return numberValue.toFixed(0)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')+' %';
  }
}

export function FormatCurrencyValue(value: number | string | undefined | null): string {
  if (value === null || value === undefined || value === '') return '';

  let numberValue: number;
  if (typeof value === 'string') {
    const cleanedValue = value.replace(/\./g, '').replace(',', '.');
    numberValue = parseFloat(cleanedValue);
  } else {
    numberValue = value;
  }

  if (isNaN(numberValue)) return '';

  const formattedNumber = numberValue
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const prefixCurrencies = ['US Dollar', 'Canadian Dollar', 'Euro', 'British Pound', 'Brazilian Real', 'Mexican Peso', 'Swiss Franc'];
  const suffixCurrencies = ['Mozambican MZN', 'Mozambican MT', 'Swedish Krona', 'Polish Zloty', 'Russian Ruble'];

  let currencyName = new FormatCurrencyRepository().getInitialCurrencyStored();


  let symbol = '';
  switch (currencyName) {
    case 'US Dollar': symbol = '$'; break;
    case 'Canadian Dollar': symbol = 'C$'; break;
    case 'Euro': symbol = '€'; break;
    case 'British Pound': symbol = '£'; break;
    case 'Brazilian Real': symbol = 'R$'; break;
    case 'Mexican Peso': symbol = '$'; break;
    case 'Swiss Franc': symbol = 'CHF'; break;
    case 'Mozambican MZN': symbol = 'MZN'; break;
    case 'Mozambican MT': symbol = 'MT'; break;
    case 'Swedish Krona': symbol = 'kr'; break;
    case 'Polish Zloty': symbol = 'zł'; break;
    case 'Russian Ruble': symbol = '₽'; break;
    default: symbol = currencyName;
  }

  if (prefixCurrencies.includes(currencyName)) {
    return `${symbol} ${formattedNumber}`;
  } else if (suffixCurrencies.includes(currencyName)) {
    return `${formattedNumber} ${symbol}`;
  } else {
    return `${formattedNumber} ${symbol}`;
  }
}

export function FormatCurrency(value: number | string | undefined | null): string
{
  if (value === null || value === undefined || value === '') return '';

  let numberValue: number;
  if (typeof value === 'string') {
    const cleanedValue = value.replace(/\./g, '').replace(',', '.');
    numberValue = parseFloat(cleanedValue);
  } else {
    numberValue = value;
  }

  if (isNaN(numberValue)) return '';

  const formattedNumber = numberValue
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return formattedNumber;
}

export function FormatDateByCountry(value: string | Date | undefined | null): string {
  if (!value) return '';

  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '';

  let options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  };

  let country = new FormatCountryRepository().getInitialCountryStored();
  let locale = 'en-US';

  switch (country) {
    case 'Mozambique':
      locale = 'pt-MZ';
      options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      break;
    case 'Brazil':
      locale = 'pt-BR';
      options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      break;
    case 'United States':
      locale = 'en-US';
      options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      break;
    case 'United Kingdom':
      locale = 'en-GB';
      options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      break;
    case 'Germany':
      locale = 'de-DE';
      options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      break;
    case 'Japan':
      locale = 'ja-JP';
      options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      break;
    case 'Canada':
      locale = 'en-CA';
      options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      break;
    case 'China':
      locale = 'zh-CN';
      options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      break;
    default:
      locale = 'en-US';
  }

  return date.toLocaleString(locale, options);
}

export function FormatChartPercent(value: number | string | undefined | null): string {
  if (value === null || value === undefined || value === '') return '';

  let numberValue: number;

  if (typeof value === 'string') {
    const cleanedValue = value.replace(/\./g, '').replace(',', '.');
    numberValue = parseFloat(cleanedValue);
  } else {
    numberValue = value;
  }

  if (isNaN(numberValue)) return '';

  return numberValue.toFixed(0)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')+' %';
}

export function FormatChartPercentDecimal(value: number | string | undefined | null): string {
  if (value === null || value === undefined || value === '') return '';

  let numberValue: number;

  if (typeof value === 'string') {
    const cleanedValue = value.replace(/\./g, '').replace(',', '.');
    numberValue = parseFloat(cleanedValue);
  } else {
    numberValue = value;
  }

  if (isNaN(numberValue)) return '';

  return numberValue.toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')+' %';
}

export function FormatDateByCountryNoTime(value: string | number | Date | undefined | null): string {
  if (!value || value == null) return '';

  const date = new Date(value);
  if (isNaN(date.getTime())) return '';

  let options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit'
  };

  let country = new FormatCountryRepository().getInitialCountryStored();
  let locale = 'en-US';

  switch (country) {
    case 'Mozambique':
      locale = 'pt-MZ';
      options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      break;
    case 'Brazil':
      locale = 'pt-BR';
      options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      break;
    case 'United States':
      locale = 'en-US';
      options = { month: '2-digit', day: '2-digit', year: 'numeric' };
      break;
    case 'United Kingdom':
      locale = 'en-GB';
      options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      break;
    case 'Germany':
      locale = 'de-DE';
      options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      break;
    case 'Japan':
      locale = 'ja-JP';
      options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      break;
    case 'Canada':
      locale = 'en-CA';
      options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      break;
    case 'China':
      locale = 'zh-CN';
      options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      break;
    default:
      locale = 'en-US';
  }

  return date.toLocaleString(locale, options);
}

export function capitalizeWords(value: string): string
{
  return value
    .toLowerCase()
    .split(' ')
    .map(word =>
      word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : ''
    )
    .join(' ');
}

export function UpperCaseWords(value: string): string
{
  return value
    .toUpperCase()
    .split(' ')
    .map(word =>
      word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : ''
    )
    .join(' ');
}

export function formatPhoneNumber(input: string): string {
  if (!input) return input;

  if (input.length < 5) return input;

  const part1 = input.substring(0, 2);
  const part2 = input.substring(2, 5);
  const part3 = input.substring(5);

  return `${part1} ${part2} ${part3}`;
}
