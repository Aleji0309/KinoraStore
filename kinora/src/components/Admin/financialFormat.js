import { formatCurrency } from "../../utils/formatCurrency";
export const money = (value) => `${formatCurrency(value, "MXN")} MXN`;
export const percentage = (value) => `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(value)}%`;
export const costValue = (value, format = money) => value === null ? "Datos de costo incompletos" : format(value);
