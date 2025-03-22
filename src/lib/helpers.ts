import { NetworkInfo, VaultInfo, SimulationResult, FormData } from "./types";

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
};

// Vault metadata
export const vaultInfo: Record<string, VaultInfo> = {
  "ycUSDCe": {
    name: "USDC.e Vault",
    image: "/assets/usdc.svg",
    assetType: "USDC.e",
    isUSD: true,
  },
  "ycUSDC": {
    name: "USDC Vault",
    image: "/assets/usdc.svg",
    assetType: "USDC",
    isUSD: true,
  },
  "ycCRVUSD": {
    name: "crvUSD Vault",
    image: "/assets/crvusd.svg",
    assetType: "crvUSD",
    isUSD: true,
  },
  "ycUSDT": {
    name: "USDT Vault",
    image: "/assets/usdt.svg",
    assetType: "USDT",
    isUSD: true,
  },
  "ycETH": {
    name: "ETH Vault",
    image: "/assets/eth.svg",
    assetType: "WETH",
    isUSD: false,
  },
  "ycsUSDC": {
    name: "USDC.e Vault",
    image: "/assets/usdc.svg",
    assetType: "USDC",
    isUSD: true,
  },
  "stGOA": {
    name: "GOA Staking",
    image: "/assets/goa.png",
    assetType: "GOA",
    isUSD: false,
  },
};

// Chart colors
export const chartColors = [
  "#8985D8",
  "#8985D8",
  "#8985D8",
  "#8985D8",
  "#8985D8",
];

// Calculate investment growth over time
export function calculateInvestmentGrowth(
  formData: FormData,
  apy: number,
  updateAsset?: string
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

  const totalMonths = timeFrameUnit === 'years' ? timeFrameValue * 12 : timeFrameValue;
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
          timeLabel = remainingMonths === 0 ? `${years}y` : `${years}y ${remainingMonths}m`;
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
    const monthlyRate = Math.pow(1 + apy, 1/12) - 1;
    
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
          timeLabel = remainingMonths === 0 ? `${years}y` : `${years}y ${remainingMonths}m`;
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

  // Create color index based on vaultId to keep colors consistent
  const colorIndex = vaultId.charCodeAt(0) % chartColors.length;

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
    color: chartColors[colorIndex],
    timeFrameValue,
    timeFrameUnit,
    returns: {
      finalValue,
      totalInvested,
      profit,
      percentageReturn
    }
  };
}


export function formatCurrency(value: number, assetType?: string): string {
  // Handle ETH or GOA display
  if (assetType === "WETH" || assetType === "ETH") {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value) + " ETH";
  } else if (assetType === "GOA") {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value) + " GOA";
  }
  
  // Default to USD formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}