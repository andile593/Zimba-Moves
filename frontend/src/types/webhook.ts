export interface WebhookLog {
  id?: string;
  gateway: string; // e.g. 'PAYSTACK' | 'OZOW'
  payload: Record<string, any>; // raw event data
  headers: Record<string, any>;
  receivedAt?: string;
}

export type CreateWebhookLogInput = {
  gateway: string;
  payload: Record<string, any>;
  headers: Record<string, any>;
};
