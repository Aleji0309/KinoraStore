const currencyFormatters = new Map();
const getCurrencyFormatter = (currency) => {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(currency, new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }));
  }
  return currencyFormatters.get(currency);
};
export const formatCurrency = (price, currency) => getCurrencyFormatter(currency).format(price);
