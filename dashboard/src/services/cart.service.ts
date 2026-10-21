
import type { Product } from './product.service';
import { getProductImageUrl } from './product.service';

export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  price: string;
  imageUrl: string | null;
  quantity: number;
  stock: number;
}

const CART_STORAGE_KEY = 'novashop_cart';
export const CART_UPDATED_EVENT = 'novashop-cart-updated';

function announceCartUpdate(): void {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartItems(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as CartItem[];
  } catch {
    return [];
  }
}

function saveCartItems(items: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  announceCartUpdate();
}

export function addToCart(product: Product, quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Quantity must be a positive whole number.');
  }

  if (product.stock < 1 || quantity > product.stock) {
    throw new Error('The requested quantity is not available.');
  }

  const items = getCartItems();
  const existingItem = items.find(
    (item) => item.productId === product.id,
  );
  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (nextQuantity > product.stock) {
    throw new Error('The cart quantity would exceed available stock.');
  }

  const featuredImage =
    product.images.find((image) => image.isFeatured) ??
    product.images[0] ??
    null;

  const updatedItem: CartItem = {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.salePrice || product.price,
    imageUrl: featuredImage
      ? getProductImageUrl(featuredImage.url)
      : null,
    quantity: nextQuantity,
    stock: product.stock,
  };

  const updatedItems = existingItem
    ? items.map((item) =>
        item.productId === product.id ? updatedItem : item,
      )
    : [...items, updatedItem];

  saveCartItems(updatedItems);
}

export function updateCartQuantity(
  productId: number,
  quantity: number,
): void {
  const items = getCartItems();
  const item = items.find((current) => current.productId === productId);

  if (!item) {
    throw new Error('This product is no longer in your cart.');
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Quantity must be at least 1.');
  }

  if (quantity > item.stock) {
    throw new Error('The requested quantity exceeds available stock.');
  }

  saveCartItems(
    items.map((current) =>
      current.productId === productId
        ? { ...current, quantity }
        : current,
    ),
  );
}

export function removeFromCart(productId: number): void {
  const items = getCartItems();
  const updatedItems = items.filter(
    (item) => item.productId !== productId,
  );

  if (updatedItems.length === items.length) {
    return;
  }

  saveCartItems(updatedItems);
}

export function clearCart(): void {
  saveCartItems([]);
}

export function getCartItemCount(): number {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}
