import api from './api';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  quantity?: number;
  minimumQuantity?: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
}

export interface CreateVariantRequest {
  productId: string;
  size: string;
  color: string;
  sku: string;
  sizeId: string;
  colorId: string;
  initialQuantity: number;
  minimumQuantity: number;
}

interface ProductVariantApiResponse {
  id: string;
  productId: string;
  productName: string;
  sizeId: number;
  sizeName: string;
  colorId: number;
  colorName: string;
  sku: string;
  isActive: boolean;
  quantity: number;
  minimumQuantity: number;
}

interface ProductApiResponse {
  id: string;
  productCategoryId: number;
  productCategoryName: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  variants: ProductVariantApiResponse[];
}

interface SearchVariantApiResponse {
  productVariantId: string;
  productId: string;
  productName: string;
  sku: string;
  sizeName: string;
  colorName: string;
  price: number;
  quantity: number;
}

const mapVariant = (
  variant: ProductVariantApiResponse | SearchVariantApiResponse
): ProductVariant => ({
  id: 'id' in variant ? variant.id : variant.productVariantId,
  productId: variant.productId,
  sku: variant.sku,
  size: variant.sizeName,
  color: variant.colorName,
  price: 'price' in variant ? variant.price : 0,
  quantity: variant.quantity,
  minimumQuantity: 'minimumQuantity' in variant ? variant.minimumQuantity : undefined
});

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<ProductApiResponse[]>('/products');
  return response.data.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    categoryId: String(product.productCategoryId),
    categoryName: product.productCategoryName,
    isActive: product.isActive
  }));
};

export const createProduct = async (data: CreateProductRequest): Promise<Product> => {
  const response = await api.post<ProductApiResponse>('/products', {
    name: data.name,
    description: data.description,
    price: data.price,
    productCategoryId: Number(data.categoryId)
  });

  return {
    id: response.data.id,
    name: response.data.name,
    description: response.data.description,
    price: response.data.price,
    categoryId: String(response.data.productCategoryId),
    categoryName: response.data.productCategoryName,
    isActive: response.data.isActive
  };
};

export const searchVariants = async (query: string): Promise<ProductVariant[]> => {
  const response = await api.get<SearchVariantApiResponse[]>('/products/variants/search', {
    params: { query }
  });
  return response.data.map(mapVariant);
};

export const createVariant = async (data: CreateVariantRequest): Promise<ProductVariant> => {
  const response = await api.post<ProductVariantApiResponse>('/products/variants', {
    productId: data.productId,
    sizeId: Number(data.sizeId),
    colorId: Number(data.colorId),
    sku: data.sku,
    initialQuantity: data.initialQuantity,
    minimumQuantity: data.minimumQuantity
  });

  return mapVariant(response.data);
};
