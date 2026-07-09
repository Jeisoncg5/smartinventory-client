import api from './api';

export interface InvoiceItem {
  id: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  subTotal: number;
  tax: number;
  total: number;
  customerName?: string;
  customerDocument?: string;
  saleOrigin: string;
  items: InvoiceItem[];
}

interface InvoiceItemApiResponse {
  productName: string;
  sku: string;
  sizeName: string;
  colorName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface InvoiceApiResponse {
  id: string;
  saleId: string;
  invoiceNumber: string;
  invoiceStatusName: string;
  saleOriginName: string;
  createdAt: string;
  total: number;
  items: InvoiceItemApiResponse[];
}

const mapInvoiceOrigin = (saleOriginName: string): 'CHATBOT' | 'POS' =>
  saleOriginName.toLowerCase() === 'chatbot' ? 'CHATBOT' : 'POS';

const mapInvoice = (invoice: InvoiceApiResponse): Invoice => {
  const subTotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    createdAt: invoice.createdAt,
    subTotal,
    tax: Math.max(invoice.total - subTotal, 0),
    total: invoice.total,
    saleOrigin: mapInvoiceOrigin(invoice.saleOriginName),
    items: invoice.items.map(item => ({
      id: `${invoice.id}-${item.sku}-${item.quantity}`,
      productName: item.productName,
      sku: item.sku,
      size: item.sizeName,
      color: item.colorName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.subtotal
    }))
  };
};

export const getInvoices = async (): Promise<Invoice[]> => {
  const response = await api.get<InvoiceApiResponse[]>('/invoices');
  return response.data.map(mapInvoice);
};

export const getInvoiceByNumber = async (invoiceNumber: string): Promise<Invoice | null> => {
  try {
    const response = await api.get<InvoiceApiResponse>(`/invoices/number/${invoiceNumber}`);
    return mapInvoice(response.data);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};
