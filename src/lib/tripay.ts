
import crypto from 'node:crypto';

interface TripayEnv {
  TRIPAY_API_KEY: string;
  TRIPAY_PRIVATE_KEY: string;
  TRIPAY_MERCHANT_CODE: string;
  TRIPAY_SANDBOX?: string;
}

export function getTripayConfig(env: TripayEnv) {
  const isSandbox = env.TRIPAY_SANDBOX !== 'false';
  return {
    apiKey: env.TRIPAY_API_KEY,
    privateKey: env.TRIPAY_PRIVATE_KEY,
    merchantCode: env.TRIPAY_MERCHANT_CODE,
    baseUrl: isSandbox 
      ? 'https://tripay.co.id/api-sandbox'
      : 'https://tripay.co.id/api'
  };
}

export function createSignature(
  merchantCode: string,
  merchantRef: string,
  amount: number,
  privateKey: string
) {
  return crypto
    .createHmac('sha256', privateKey)
    .update(merchantCode + merchantRef + amount)
    .digest('hex');
}

export async function createTransaction(env: TripayEnv, data: {
  method: string;
  merchantRef: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  orderItems: Array<{ name: string; price: number; quantity: number }>;
  callbackUrl: string;
  returnUrl: string;
}) {
  const config = getTripayConfig(env);
  const signature = createSignature(
    config.merchantCode,
    data.merchantRef,
    data.amount,
    config.privateKey
  );
  
  const response = await fetch(`${config.baseUrl}/transaction/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      method: data.method,
      merchant_ref: data.merchantRef,
      amount: data.amount,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      order_items: data.orderItems,
      callback_url: data.callbackUrl,
      return_url: data.returnUrl,
      signature
    })
  });
  
  return response.json();
}

export function verifyCallback(json: any, privateKey: string): boolean {
  const signature = crypto
    .createHmac('sha256', privateKey)
    .update(JSON.stringify(json))
    .digest('hex');
  return signature === json.signature;
}
