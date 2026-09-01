import { marketConfig } from "../config/markets";
const currencyFormatters = new Map();
const getCurrencyFormatter = (currency, locale) => {
  const formatterKey = `${locale}:${currency}`;
  if (!currencyFormatters.has(formatterKey)) {
    currencyFormatters.set(formatterKey, new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }));
  }
  return currencyFormatters.get(formatterKey);
};
export const formatCurrency = (price, currency = marketConfig.currency, locale = marketConfig.locale) => (
  getCurrencyFormatter(currency, locale).format(price)
);
