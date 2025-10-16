import api from './axios';
import type { CreateQuoteInput, Quote } from '../types'; 

export const getQuotes = () => api.get<Quote[]>('/quotes');
export const getQuoteById = (id: string) => api.get<Quote>(`/quotes/${id}`);
export const createQuote = (quote: CreateQuoteInput) => api.post<Quote>('/quotes', quote);

export type UpdateQuoteInput = { id: string; quote: Partial<Quote> };
export const updateQuote = ({ id, quote }: UpdateQuoteInput) => 
  api.put(`/quotes/${id}`, quote);

export type DeleteQuoteInput = { id: string };
export const deleteQuote = ({ id }: DeleteQuoteInput) => 
  api.delete(`/quotes/${id}`);