import { NetworkInfo, VaultInfo, SimulationResult, FormData, CompetitorInfo } from "./types";

// Network metadata
export const networkInfo: Record<string, NetworkInfo> = {
  "146": {
    name: "Sonic",
    image: "/networks/sonic.svg",
  },
  "42161": {
    name: "Arbitrum",
    image: "/networks/arbitrum.svg",
  },
  "1": {
    name: "Ethereum",
    image: "/networks/ethereum.svg",
  },
  "8453": {
    name: "Base",
    image: "/networks/base.webp",
  }
};

// Vault metadata
export const vaultInfo: Record<string, VaultInfo> = {
  ycUSDCe: {
    name: "USDC.e Vault",
    image: "/assets/usdc.svg",
    assetType: "USDC.e",
    isUSD: true,
  },
  ycUSDC: {
    name: "USDC Vault",
    image: "/assets/usdc.svg",
    assetType: "USDC",
    isUSD: true,
  },
  ycCRVUSD: {
    name: "crvUSD Vault",
    image: "/assets/crvusd.svg",
    assetType: "crvUSD",
    isUSD: true,
  },
  ycUSDT: {
    name: "USDT Vault",
    image: "/assets/usdt.svg",
    assetType: "USDT",
    isUSD: true,
  },
  ycETH: {
    name: "ETH Vault",
    image: "/assets/eth.svg",
    assetType: "WETH",
    isUSD: false,
  },
  ycsUSDC: {
    name: "USDC.e Vault",
    image: "/assets/usdc.svg",
    assetType: "USDC",
    isUSD: true,
  },
  stGOA: {
    name: "GOA Staking",
    image: "/assets/goa.png",
    assetType: "GOA",
    isUSD: false,
  },
};

// Competitor metadata
export const competitorInfo: Record<string, CompetitorInfo> = {
  "aave-usdc-arbitrum": {
    id: "aave-usdc-arbitrum",
    name: "AAVE USDC",
    image: "/assets/aave.svg",
    poolId: "d9fa8e14-0447-4207-9ae8-7810199dfa1f",
    assetType: "USDC",
    isUSD: true,
    networkId: "42161" // Arbitrum
  },
  "aave-eth-arbitrum": {
    id: "aave-eth-arbitrum",
    name: "AAVE ETH",
    image: "/assets/aave.svg",
    poolId: "e302de4d-952e-4e18-9749-0a9dc86e98bc", // This is a placeholder, use the correct pool ID
    assetType: "WETH",
    isUSD: false,
    networkId: "42161" // Arbitrum
  },
  "aave-usdt-arbitrum": {
    id: "aave-usdt-arbitrum",
    name: "AAVE USD₮0",
    image: "/assets/aave.svg",
    poolId: "3a6cc030-738d-4e19-8a40-e63e9c4d5a6f", // This is a placeholder, use the correct pool ID
    assetType: "USDT",
    isUSD: true,
    networkId: "42161" // Arbitrum
  },
  "scrvusd": {
    id: "scrvusd",
    name: "SCRVUSD",
    image: "/assets/scrvusd.png",
    poolId: "5fd328af-4203-471b-bd16-1705c726d926", // This is a placeholder, use the correct pool ID
    assetType: "crvUSD",
    isUSD: true,
    networkId: "1" // ETH Mainnet
  },
  "morpho-blue-sparkUSDC": {
    id: "SPARKUSDC",
    name: "Morpho SPARKUSDC",
    image: "/assets/morpho.webp",
    poolId: "9f146531-9c31-46ba-8e26-6b59bdaca9ff", // This is a placeholder, use the correct pool ID
    assetType: "USDC",
    isUSD: true,
    networkId: "8453" // Base
  },
  "morpho-blue-moonwellETH": {
    id: "morpho-blue-moonwellETH",
    name: "Morpho Moonwell ETH",
    image: "/assets/morpho.webp",
    poolId: "e41c04d6-53b7-4e36-8de0-edda6f627103",
    assetType: "WETH",
    isUSD: false,
    networkId: "8453"
  },
  "compound-v3-usdt-arb": {
    id: "compound-v3-usdt-arb",
    name: "Compound V3 USDT",
    image: "/assets/compound.webp",
    poolId: "85247b13-8180-44e7-b38c-4d324cc68a92", // This is a placeholder, use the correct pool ID
    assetType: "USDT",
    isUSD: true,
    networkId: "42161" // Arbitrum
  },
  "crvusd-yearn": {
    id: "crvusd-yearn",
    name: "Yearn crvUSD",
    image: "/assets/yearn.webp",
    poolId: "a4236681-173c-4a52-97d2-30c61f07141b", // This is a placeholder, use the correct pool ID
    assetType: "crvUSD",
    isUSD: true,
    networkId: "1" // ETH Mainnet
  }
};

const usdcCompetitors = [
  "aave-usdc-arbitrum",
  "morpho-blue-sparkUSDC",
];

const usdtCompetitors = [
  "aave-usdt-arbitrum",
  "compound-v3-usdt-arb",
];

const ethCompetitors = [
  "aave-eth-arbitrum",
  "morpho-blue-moonwellETH",
];

const crvUSDCompetitors = [
  "scrvusd",
  "crvusd-yearn",
];

// Map vault types to their relevant competitors
export const vaultCompetitors: Record<string, string[]> = {
  // USDC vaults and their competitors
  "ycUSDC": usdcCompetitors,
  "ycUSDCe": usdcCompetitors,
  "ycsUSDC": usdcCompetitors,

  "ycUSDT": usdtCompetitors,

  // ETH vaults and their competitors
  "ycETH": ethCompetitors,

  // crvUSD vaults and their competitors
  "ycCRVUSD": crvUSDCompetitors,
};

// Chart colors
export const chartColor = "#8985D8";
export const competitorColor = "#D7BBFA";

// Calculate investment growth over time
export function calculateInvestmentGrowth(
  formData: FormData,
  apy: number,
  updateAsset?: string,
  competitor?: boolean,
): SimulationResult | null {
  // Return null for zero APY vaults
  if (apy === 0) {
    return null;
  }

  const {
    initialAmount,
    monthlyContribution,
    timeFrameValue,
    timeFrameUnit,
    networkId,
    vaultId,
  } = formData;

  const totalMonths =
    timeFrameUnit === "years" ? timeFrameValue * 12 : timeFrameValue;
  const dataPoints: { time: string; value: number }[] = [];

  let currentValue = initialAmount;

  // Add initial point
  dataPoints.push({
    time: "Start",
    value: currentValue,
  });

  // Calculate growth differently based on whether there are monthly contributions
  if (monthlyContribution === 0) {
    // If no monthly contributions, we can calculate value directly using the APY
    for (let month = 1; month <= totalMonths; month++) {
      // Calculate value based on annual compounded rate
      const years = month / 12;
      currentValue = initialAmount * Math.pow(1 + apy, years);

      // Add data point every quarter or at the end
      if (month % 3 === 0 || month === totalMonths) {
        let timeLabel;
        if (month < 12) {
          timeLabel = `${month}m`;
        } else {
          const years = Math.floor(month / 12);
          const remainingMonths = month % 12;
          timeLabel =
            remainingMonths === 0
              ? `${years}y`
              : `${years}y ${remainingMonths}m`;
        }

        dataPoints.push({
          time: timeLabel,
          value: Number(currentValue.toFixed(2)),
        });
      }
    }
  } else {
    // If there are monthly contributions, we need to calculate month by month
    // Convert annual rate to monthly rate
    const monthlyRate = Math.pow(1 + apy, 1 / 12) - 1;

    for (let month = 1; month <= totalMonths; month++) {
      // Add interest
      currentValue = currentValue * (1 + monthlyRate);

      // Add monthly contribution
      currentValue += monthlyContribution;

      // Add data point every quarter or at the end
      if (month % 3 === 0 || month === totalMonths) {
        let timeLabel;
        if (month < 12) {
          timeLabel = `${month}m`;
        } else {
          const years = Math.floor(month / 12);
          const remainingMonths = month % 12;
          timeLabel =
            remainingMonths === 0
              ? `${years}y`
              : `${years}y ${remainingMonths}m`;
        }

        dataPoints.push({
          time: timeLabel,
          value: Number(currentValue.toFixed(2)),
        });
      }
    }
  }

  // Calculate return metrics
  const finalValue = dataPoints[dataPoints.length - 1].value;
  const totalContributions = monthlyContribution * totalMonths;
  const totalInvested = initialAmount + totalContributions;
  const profit = finalValue - totalInvested;
  const percentageReturn = (profit / totalInvested) * 100;

  return {
    vaultId,
    networkId,
    vaultName: vaultInfo[vaultId]?.name || vaultId,
    networkName: networkInfo[networkId]?.name || networkId,
    apy,
    dataPoints,
    initialAmount,
    monthlyContribution,
    asset: updateAsset || vaultInfo[vaultId]?.assetType,
    color: competitor ? competitorColor : chartColor,
    timeFrameValue,
    timeFrameUnit,
    returns: {
      finalValue,
      totalInvested,
      profit,
      percentageReturn,
    },
  };
}

export function formatCurrency(value: number, assetType?: string): string {
  // Handle ETH or GOA display
  if (assetType === "WETH" || assetType === "ETH") {
    return (
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(value) + " ETH"
    );
  } else if (assetType === "GOA") {
    return (
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }).format(value) + " GOA"
    );
  }

  // Default to USD formatting
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
