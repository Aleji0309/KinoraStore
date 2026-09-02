const currencyFormatters = new Map();
const getCurrencyFormatter = (currency) => {
  if (!currencyFormatters.has(currency)) {
    const locale = currency === "CRC" ? "es-CR" : "es-MX";
    currencyFormatters.set(currency, new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }));
  }
  return currencyFormatters.get(currency);
};
export const formatCurrency = (price, currency) => getCurrencyFormatter(currency).format(price);
