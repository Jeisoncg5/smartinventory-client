import api from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Size {
  id: string;
  name: string;
}

export interface Color {
  id: string;
  name: string;
}

interface CatalogApiResponse {
  id: number;
  name: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<CatalogApiResponse[]>('/catalogs/product-categories');
  return response.data.map(category => ({
    id: String(category.id),
    name: category.name
  }));
};

export const getSizes = async (): Promise<Size[]> => {
  const response = await api.get<CatalogApiResponse[]>('/catalogs/sizes');
  return response.data.map(size => ({
    id: String(size.id),
    name: size.name
  }));
};

export const getColors = async (): Promise<Color[]> => {
  const response = await api.get<CatalogApiResponse[]>('/catalogs/colors');
  return response.data.map(color => ({
    id: String(color.id),
    name: color.name
  }));
};
