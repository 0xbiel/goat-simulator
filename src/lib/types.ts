export interface VaultData {
  [vaultId: string]: number | string;
}

export interface NetworkData {
  [networkId: string]: VaultData;
}

export interface ApiResponse {
  success: boolean;
  status: number;
  message: string | null;
  data: NetworkData;
}

export interface PriceData {
  name: string;
  price: number;
  address: string;
  decimals: number;
  chainId: number;
}

export interface NetworkPrices {
  [assetId: string]: PriceData;
}

export interface PriceApiResponse {
  success: boolean;
  status: number;
  message: string | null;
  data: {
    [networkId: string]: NetworkPrices;
  };
}

export interface NetworkInfo {
  name: string;
  image: string;
}

export interface VaultInfo {
  name: string;
  image: string;
  assetType: string;
  isUSD: boolean;
}

export interface DataPoint {
  time: string;
  value: number;
}

export interface SimulationResult {
  vaultId: string;
  networkId: string;
  vaultName: string;
  networkName: string;
  apy: number;
  dataPoints: DataPoint[];
  initialAmount: number;
  monthlyContribution: number;
  asset: string;
  color: string;
  timeFrameValue: number;
  timeFrameUnit: 'months' | 'years';
  returns: {
    finalValue: number;
    totalInvested: number;
    profit: number;
    percentageReturn: number;
  };
}

export interface FormData {
  initialAmount: number;
  monthlyContribution: number;
  timeFrameValue: number;
  timeFrameUnit: 'months' | 'years';
  networkId: string;
  vaultId: string;
  useUSD: boolean;
}
