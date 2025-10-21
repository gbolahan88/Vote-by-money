export interface Candidate {
  id: string;
  name: string;
  votes: number;
}

// make Paystack global type visible to TypeScript
declare global {
  interface Window { PaystackPop: any; }
}
export {};
