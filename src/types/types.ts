export interface GraphPoint {
    date: string;
    price: number;
    currency: string;
    volume?: number;
  }
  
  export interface Summary {
  price: string;
  extracted_price: number;
  currency: string;
  change?: string;
  changePercent?: string;
  name?: string;
  category?: string;
  unit?: string;
}
  
  export interface FinanceData {
    summary: Summary;
    graph: GraphPoint[];
  }
  
  export interface CommodityRecord {
    state: string;
    market: string;
    commodity: string;
    modal_price: string;
    min_price: string;
    max_price: string;
    arrival_date: string;
  }
  
  export interface IndiaApiResponse {
  records: CommodityRecord[];
  total?: number;
  limit?: number;
  offset?: number;
  currentPrice?: {
    price: string;
    change: string;
    changePercent: string;
  } | null;
  historicalData?: Array<{ date: string; price: number; currency: string }>;
  commodityInfo?: {
    category: string;
    unit: string;
    states: string[];
  };
}
  
  export interface Filters {
    state?: string;
    commodity?: string;
    market?: string;
  }