import { ApiResponse, PriceApiResponse, CompetitorApiResponse } from "./types";

// Define a specific error type instead of using 'any'
interface ApiError {
  message: string;
  code?: number;
  details?: unknown;
}

export async function fetchApyData(): Promise<ApiResponse> {
  try {
    const response = await fetch("https://api.goat.fi/apy");
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse = (await response.json()) as ApiResponse;

    // Filter out vaults with 0 APY from the data property
    if (apiResponse.data) {
      // Structure: data -> network ID -> vault ID -> APY value
      for (const [networkId, vaults] of Object.entries(apiResponse.data)) {
        if (typeof vaults === "object" && vaults !== null) {
          // Create a new object for this network with filtered vaults
          const filteredVaults: Record<string, string | number> = {};

          for (const [vaultId, apyValue] of Object.entries(vaults)) {
            // Only keep vaults where APY is not 0
            // Convert string APY to number if needed
            const apyNumber =
              typeof apyValue === "string" ? parseFloat(apyValue) : apyValue;
            if (apyNumber !== 0) {
              filteredVaults[vaultId] = apyValue;
            }
          }

          // Replace the network's vaults with filtered ones
          apiResponse.data[networkId] = filteredVaults;
        }
      }
    }

    return apiResponse;
  } catch (error: unknown) {
    // Convert unknown error to our typed error
    const apiError: ApiError = {
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      details: error,
    };

    console.error("API Error:", apiError);
    // Add the missing properties required by ApiResponse type
    return {
      success: false,
      data: {},
      status: 404,
      message: apiError.message,
    };
  }
}

export async function fetchPriceData(): Promise<PriceApiResponse> {
  try {
    const response = await fetch("https://api.goat.fi/prices");
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error: unknown) {
    // Convert unknown error to our typed error
    const apiError: ApiError = {
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
      details: error,
    };

    console.error("API Error:", apiError);
    throw apiError;
  }
}

export async function fetchCompetitorAPY(poolId: string): Promise<number> {
  try {
    const response = await fetch(`https://yields.llama.fi/poolsEnriched?pool=${poolId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json() as CompetitorApiResponse;
    
    if (data.status === "success" && data.data && data.data.length > 0) {
      // API returns APY as percentage (e.g., 2.62178%), so we divide by 100 to get decimal (0.0262178)
      return data.data[0].apy / 100;
    } else {
      throw new Error("No APY data available");
    }
  } catch (error: unknown) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      details: error,
    };

    console.error("Competitor API Error:", apiError);
    return 0;
  }
}
