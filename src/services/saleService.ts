import api from './api';

export interface SaleItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface CreateSaleRequest {
  customerId?: string;
  saleOriginId: number;
  items: SaleItemRequest[];
}

export interface Sale {
  id: string;
  createdAt: string;
  total: number;
  saleOrigin: 'CHATBOT' | 'POS';
  saleStatus: string;
  invoiceNumber?: string;
}

interface SaleApiResponse {
  id: string;
  createdAt: string;
  saleOriginName: string;
  saleStatusName: string;
  invoiceNumber: string;
  total: number;
}

const mapSaleOrigin = (saleOriginName: string): 'CHATBOT' | 'POS' =>
  saleOriginName.toLowerCase() === 'chatbot' ? 'CHATBOT' : 'POS';

export const getSales = async (): Promise<Sale[]> => {
  const response = await api.get<SaleApiResponse[]>('/sales');
  return response.data.map(sale => ({
    id: sale.id,
    createdAt: sale.createdAt,
    total: sale.total,
    saleOrigin: mapSaleOrigin(sale.saleOriginName),
    saleStatus: sale.saleStatusName,
    invoiceNumber: sale.invoiceNumber
  }));
};

export const createSale = async (data: CreateSaleRequest): Promise<Sale> => {
  const response = await api.post<SaleApiResponse>('/sales', data);
  return {
    id: response.data.id,
    createdAt: response.data.createdAt,
    total: response.data.total,
    saleOrigin: mapSaleOrigin(response.data.saleOriginName),
    saleStatus: response.data.saleStatusName,
    invoiceNumber: response.data.invoiceNumber
  };
};
