interface WebLN {
  enable(): Promise<void>;
  sendPayment(paymentRequest: string): Promise<void>;
}

declare global {
  interface Window {
    webln: WebLN;
  }
}

export {};
