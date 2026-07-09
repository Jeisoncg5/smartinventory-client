import axios from 'axios';
import api from './api';

export type ChatState =
  | 'SEARCHING_PRODUCT'
  | 'WAITING_CONFIRMATION'
  | 'SALE_COMPLETED'
  | 'PRODUCT_NOT_FOUND'
  | 'ERROR';

export interface ChatMessageRequest {
  sessionId: string;
  message: string;
}

export interface ChatResponse {
  response: string;
  state: ChatState;
  invoiceNumber?: string;
  saleOrigin?: string;
}

export const sendChatMessage = async (data: ChatMessageRequest): Promise<ChatResponse> => {
  try {
    const response = await api.post<ChatResponse>('/chat/message', data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      if (errorData && typeof errorData.message === 'string') {
        throw new Error(errorData.message);
      }
    }

    if (axios.isAxiosError(error) && !error.response) {
      throw new Error('No fue posible conectarse con la API. Verifica que .NET y FastAPI esten ejecutandose.');
    }

    throw new Error('Ocurrio un error al comunicarse con el chatbot.');
  }
};