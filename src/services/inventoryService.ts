import api from './api';

export interface InventoryItem {
  id: string;
  inventoryId: string;
  productId: string;
  productVariantId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  minStock: number;
  price: number;
  isLowStock: boolean;
}

export interface AdjustStockRequest {
  productVariantId: string;
  quantity: number;
  description?: string;
  reason?: string;
}

interface InventoryApiResponse {
  inventoryId: string;
  productVariantId: string;
  productName: string;
  sku: string;
  sizeName: string;
  colorName: string;
  quantity: number;
  minimumQuantity: number;
  isLowStock: boolean;
}

interface ProductApiResponse {
  id: string;
  price: number;
  variants: Array<{
    id: string;
  }>;
}

const loadVariantPriceMap = async (): Promise<Map<string, { productId: string; price: number }>> => {
  const response = await api.get<ProductApiResponse[]>('/products');
  const priceMap = new Map<string, { productId: string; price: number }>();

  for (const product of response.data) {
    for (const variant of product.variants) {
      priceMap.set(variant.id, {
        productId: product.id,
        price: product.price
      });
    }
  }

  return priceMap;
};

const mapInventoryItem = (
  item: InventoryApiResponse,
  priceMap: Map<string, { productId: string; price: number }>
): InventoryItem => {
  const priceInfo = priceMap.get(item.productVariantId);

  return {
    id: item.productVariantId,
    inventoryId: item.inventoryId,
    productId: priceInfo?.productId ?? '',
    productVariantId: item.productVariantId,
    productName: item.productName,
    sku: item.sku,
    size: item.sizeName,
    color: item.colorName,
    stock: item.quantity,
    minStock: item.minimumQuantity,
    price: priceInfo?.price ?? 0,
    isLowStock: item.isLowStock
  };
};

export const getInventory = async (): Promise<InventoryItem[]> => {
  const [inventoryResponse, priceMap] = await Promise.all([
    api.get<InventoryApiResponse[]>('/inventory'),
    loadVariantPriceMap()
  ]);

  return inventoryResponse.data.map(item => mapInventoryItem(item, priceMap));
};

export const getLowStock = async (): Promise<InventoryItem[]> => {
  const [inventoryResponse, priceMap] = await Promise.all([
    api.get<InventoryApiResponse[]>('/inventory/low-stock'),
    loadVariantPriceMap()
  ]);

  return inventoryResponse.data.map(item => mapInventoryItem(item, priceMap));
};

export const adjustStock = async (data: AdjustStockRequest): Promise<InventoryItem> => {
  const [response, priceMap] = await Promise.all([
    api.post<InventoryApiResponse>('/inventory/adjust', {
      productVariantId: data.productVariantId,
      quantity: data.quantity,
      description: data.description ?? data.reason
    }),
    loadVariantPriceMap()
  ]);

  return mapInventoryItem(response.data, priceMap);
};
