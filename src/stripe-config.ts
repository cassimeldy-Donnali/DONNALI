export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export const STRIPE_PRODUCTS: Record<string, StripeProduct> = {
  contact: {
    priceId: 'price_1TCAxDGkzAjXlnPACsv4z0yp',
    name: 'Contact',
    description: 'Déblocage contact (mail+numero de télephone)',
    price: 2.99,
    currency: 'eur',
    mode: 'payment'
  }
};

export const STRIPE_IDENTITY_PRICE = 1.50;

export const formatPrice = (price: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  return formatter.format(price);
};