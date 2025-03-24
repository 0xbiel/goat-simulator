"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApyData, fetchPriceData, fetchCompetitorAPY } from "@/lib/api";
import {
  networkInfo,
  vaultInfo,
  competitorInfo,
  vaultCompetitors,
  calculateInvestmentGrowth,
} from "@/lib/helpers";
import { ApiResponse, SimulationResult, FormData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Loader2, BarChart2, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InvestmentFormProps {
  onCalculate: (results: SimulationResult[]) => void;
}

export default function InvestmentForm({ onCalculate }: InvestmentFormProps) {
  // Use null initial state and client-side initialization to avoid hydration mismatch
  const [loading, setLoading] = useState(true);
  const [apyData, setApyData] = useState<ApiResponse | null>(null);

  const [formData, setFormData] = useState<FormData | null>(null);
  const dataFetchedRef = useRef(false);
  
  // New state for competitor features
  const [showCompetitors, setShowCompetitors] = useState(false);
  const [competitorAPY, setCompetitorAPY] = useState<Record<string, number>>({});
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [loadingCompetitor, setLoadingCompetitor] = useState(false);
  
  // New state for vault selection modal
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  // New state for search functionality
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize form data on client-side only
  useEffect(() => {
    setFormData({
      initialAmount: 1000,
      monthlyContribution: 100,
      timeFrameValue: 5,
      timeFrameUnit: "years",
      networkId: "",
      vaultId: "",
      useUSD: true,
    });
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [apyResponse] = await Promise.all([
          fetchApyData(),
          fetchPriceData(), // We're still calling this but not using the response
        ]);

        setApyData(apyResponse);

        // Set default networkId to first available network
        if (apyResponse.success && Object.keys(apyResponse.data).length > 0) {
          const firstNetworkId = Object.keys(apyResponse.data)[0];
          setFormData((prev) => ({
            ...prev!,
            networkId: firstNetworkId,
            vaultId: Object.keys(apyResponse.data[firstNetworkId])[0],
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (formData && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
      fetchData();
    }
  }, [formData]);

  // Handle form changes
  const handleChange = (name: keyof FormData, value: unknown) => {
    if (!formData) return;

    // For number inputs, ensure there are no leading zeros
    if (typeof value === "number") {
      value = parseFloat(value.toString());
    }

    setFormData((prev) => ({ ...prev!, [name]: value }));

    // If network changes, update vaultId to first vault in that network
    if (name === "networkId" && apyData) {
      const firstVaultId = Object.keys(apyData.data[value as string])[0];
      setFormData((prev) => ({
        ...prev!,
        networkId: value as string,
        vaultId: firstVaultId,
      }));
      
      // Reset competitor selection when network changes
      const newAvailableCompetitors = vaultCompetitors[firstVaultId] || [];
      if (showCompetitors && selectedCompetitor && !newAvailableCompetitors.includes(selectedCompetitor)) {
        setSelectedCompetitor(null);
      }
    }
    
    // If vault changes, check if the selected competitor is available for this vault
    if (name === "vaultId") {
      const newVaultId = value as string;
      const newAvailableCompetitors = vaultCompetitors[newVaultId] || [];
      
      // If there's a selected competitor that's not available for the new vault, reset it
      if (selectedCompetitor && !newAvailableCompetitors.includes(selectedCompetitor)) {
        setSelectedCompetitor(null);
      }
    }
  };

  // Function to handle input changes and strip leading zeros
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof FormData) => {
    const inputValue = e.target.value;
    
    // Remove any leading zeros but keep the first zero if it's the only digit
    const cleanedValue = inputValue.replace(/^0+(?=\d)/, '');
    
    // Parse as float for the state
    const numericValue = parseFloat(cleanedValue) || 0;
    
    // Update the form data state with the numeric value
    handleChange(name, numericValue);
    
    // Need to update the input field directly to show periods instead of commas
    // Using setTimeout to ensure this runs after React's event handling
    setTimeout(() => {
      const inputElement = document.getElementById(name as string) as HTMLInputElement;
      if (inputElement && inputElement.value !== cleanedValue) {
        inputElement.value = cleanedValue;
      }
    }, 0);
  };

  // Function to toggle competitor visibility
  const toggleCompetitors = () => {
    const newShowCompetitors = !showCompetitors;
    setShowCompetitors(newShowCompetitors);
    
    // Reset competitor selection when hiding
    if (!newShowCompetitors) {
      setSelectedCompetitor(null);
    } 
    // Load all competitor data when showing
    else if (formData?.vaultId) {
      loadAllCompetitorsData(formData.vaultId);
    }
  };

  // Function to load all competitor APY data for a vault
  const loadAllCompetitorsData = async (vaultId: string) => {
    const competitors = vaultCompetitors[vaultId] || [];
    if (competitors.length === 0) return;

    setLoadingCompetitor(true);
    try {
      // Create an array of promises for all competitors that haven't been loaded yet
      const loadPromises = competitors
        .filter(id => competitorAPY[id] === undefined)
        .map(async (competitorId) => {
          try {
            const poolId = competitorInfo[competitorId].poolId;
            const apy = await fetchCompetitorAPY(poolId);
            return { competitorId, apy };
          } catch (error) {
            console.error(`Error loading data for ${competitorId}:`, error);
            return { competitorId, apy: 0 }; // Default value on error
          }
        });

      // Wait for all fetches to complete
      const results = await Promise.all(loadPromises);
      
      // Update the state with all results at once
      setCompetitorAPY(prev => {
        const updated = { ...prev };
        results.forEach(result => {
          updated[result.competitorId] = result.apy;
        });
        return updated;
      });
    } catch (error) {
      console.error("Error loading competitor data:", error);
    } finally {
      setLoadingCompetitor(false);
    }
  };

  // Function to select a competitor
  const handleCompetitorSelect = (competitorId: string | null) => {
    // Convert "none" string back to null for internal processing
    const actualCompetitorId = competitorId === "none" ? null : competitorId;
    setSelectedCompetitor(actualCompetitorId);
  };
  
  // Function to handle vault selection from modal
  const handleVaultSelect = (vaultId: string) => {
    if (!formData) return;
    
    setFormData((prev) => ({
      ...prev!,
      vaultId: vaultId,
    }));
    
    // Close the modal after selection
    setVaultModalOpen(false);
    
    // Reset competitor selection when vault changes
    const newAvailableCompetitors = vaultCompetitors[vaultId] || [];
    if (showCompetitors && selectedCompetitor && !newAvailableCompetitors.includes(selectedCompetitor)) {
      setSelectedCompetitor(null);
    }
  };

  // Reset search query when modal closes
  useEffect(() => {
    if (!vaultModalOpen) {
      setSearchQuery('');
    }
  }, [vaultModalOpen]);

  // Auto-load competitor data when vault changes and competitors are shown
  useEffect(() => {
    if (showCompetitors && formData?.vaultId) {
      loadAllCompetitorsData(formData.vaultId);
    }
  }, [formData?.vaultId, showCompetitors]); //eslint-disable-line react-hooks/exhaustive-deps

  // Auto-calculate whenever form data or competitor selection changes
  useEffect(() => {
    if (!apyData || !formData?.networkId || !formData?.vaultId) return;

    const results: SimulationResult[] = [];
    
    // Calculate for main vault
    const apy = Number(apyData.data[formData.networkId][formData.vaultId]);
    
    let mainResult;
    if (formData.useUSD && !vaultInfo[formData.vaultId]?.isUSD) {
      mainResult = calculateInvestmentGrowth(formData, apy, "USD");
    } else {
      mainResult = calculateInvestmentGrowth(formData, apy);
    }
    
    if (mainResult) {
      results.push(mainResult);
    }
    
    // Calculate for competitor if selected
    if (selectedCompetitor && competitorAPY[selectedCompetitor] !== undefined) {
      const competitor = competitorInfo[selectedCompetitor];
      const competitorFormData = { ...formData };
      
      // Just create a simulation result with competitor data
      const competitorResult = calculateInvestmentGrowth(
        competitorFormData, 
        competitorAPY[selectedCompetitor],
        competitor.isUSD ? competitor.assetType : undefined,
        true,
      );
      
      if (competitorResult) {
        // Override some properties to display correctly
        competitorResult.vaultId = selectedCompetitor;
        competitorResult.networkId = competitor.networkId;
        competitorResult.vaultName = competitor.name;
        competitorResult.networkName = networkInfo[competitor.networkId]?.name || competitor.networkId;
        
        results.push(competitorResult);
      }
    }
    
    // Pass results to parent component
    onCalculate(results);
  }, [formData, apyData, selectedCompetitor, competitorAPY, onCalculate]);

  // If form data isn't loaded yet, don't render inputs
  if (!formData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <p>Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if selected vault is USD
  const isSelectedVaultUSD = formData.vaultId
    ? (vaultInfo[formData.vaultId]?.isUSD ?? true)
    : true;

  // Get available competitors for the selected vault
  const availableCompetitors = formData?.vaultId ? (vaultCompetitors[formData.vaultId] || []) : [];
  const hasCompetitors = availableCompetitors.length > 0;
  
  // Get the current selected vault info for display
  const selectedVaultInfo = formData.vaultId ? vaultInfo[formData.vaultId] : undefined;
  const selectedVaultApy = formData.networkId && formData.vaultId && apyData ? 
    Number(apyData.data[formData.networkId][formData.vaultId]) * 100 : 0;
    
  // Get the current selected competitor info for display
  const selectedCompetitorInfo = selectedCompetitor ? competitorInfo[selectedCompetitor] : null;
  const selectedCompetitorApy = selectedCompetitor && competitorAPY[selectedCompetitor] !== undefined ? 
    competitorAPY[selectedCompetitor] * 100 : undefined;

  return (
    <Card>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <p>Loading vault data...</p>
          </div>
        ) : (
          <div className="grid gap-6" suppressHydrationWarning>
            <div className="grid gap-3">
              <Label htmlFor="networkId">Select Network</Label>
              <Select
                value={formData.networkId}
                onValueChange={(value) => handleChange("networkId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Network" />
                </SelectTrigger>
                <SelectContent>
                  {apyData &&
                    Object.keys(apyData.data).map((networkId) => (
                      <SelectItem
                        key={networkId}
                        value={networkId}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          {networkInfo[networkId] && (
                            <Image
                              src={networkInfo[networkId].image}
                              alt={networkInfo[networkId].name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          )}
                          {networkInfo[networkId]?.name || networkId}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="vaultId">Select Vault</Label>
              
              {/* Vault selection button that opens the modal */}
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setVaultModalOpen(true)}
                disabled={!formData.networkId}
              >
                {formData.vaultId && selectedVaultInfo ? (
                  <div className="flex items-center gap-2">
                    <Image
                      src={selectedVaultInfo.image}
                      alt={selectedVaultInfo.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span>{selectedVaultInfo.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {selectedVaultApy.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <span>Select a Vault</span>
                )}
                <ChevronRight className="h-4 w-4 ml-2 opacity-50" />
              </Button>
              
              {/* Vault selection modal */}
              <Dialog open={vaultModalOpen} onOpenChange={setVaultModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-[#12131A]">
                  <DialogHeader>
                    <DialogTitle>Select a Vault</DialogTitle>
                  </DialogHeader>
                  
                  {/* Search input */}
                  <div>
                    <Input
                      type="text"
                      placeholder="Search vaults..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#252733]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    {formData.networkId &&
                      apyData &&
                      Object.keys(apyData.data[formData.networkId])
                        .filter((vaultId) => {
                          const vault = vaultInfo[vaultId];
                          const vaultName = vault?.name || vaultId;
                          const assetType = vault?.assetType || '';
                          
                          // Filter vaults based on search query
                          if (!searchQuery) return true;
                          
                          const query = searchQuery.toLowerCase();
                          return (
                            vaultName.toLowerCase().includes(query) ||
                            assetType.toLowerCase().includes(query) ||
                            vaultId.toLowerCase().includes(query)
                          );
                        })
                        .map((vaultId) => {
                          const vault = vaultInfo[vaultId];
                          const apy = Number(
                            apyData.data[formData.networkId][vaultId]
                          ) * 100;
                          
                          return (
                            <div
                              key={vaultId}
                              className={`
                                flex flex-col border rounded-md p-4 cursor-pointer hover:bg-muted transition-colors bg-muted
                                ${formData.vaultId === vaultId ? 'border-primary' : 'border-border'}
                              `}
                              onClick={() => handleVaultSelect(vaultId)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                  <div className="float-start mr-3">
                                    {vault && (
                                      <Image
                                        src={vault.image}
                                        alt={vault.name}
                                        width={44}
                                        height={44}
                                        className="rounded-full"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-bold">{vault?.name || vaultId}</h4>
                                    <div className="flex items-center mt-1">
                                      <Card className="flex items-center p-2 py-1 bg-[#252733] rounded-sm w-auto inline-flex">
                                      <div className="flex items-center">
                                        <Image
                                        src={networkInfo[formData.networkId]?.image}
                                        alt={networkInfo[formData.networkId]?.name}
                                        width={12}
                                        height={12}
                                        className="rounded-full mr-1"
                                        />
                                        <span className="text-xs whitespace-nowrap">{networkInfo[formData.networkId]?.name || formData.networkId}</span>
                                      </div>
                                      </Card>
                                    </div>
                                  </div>
                                </div>
                                <div className="float-end text-right">
                                  <p className="font-medium text-lg">{apy.toFixed(2)}%</p>
                                  <p className="text-xs text-muted-foreground">APY</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                  
                  {/* No results message */}
                  {formData.networkId &&
                    apyData &&
                    Object.keys(apyData.data[formData.networkId]).filter((vaultId) => {
                      const vault = vaultInfo[vaultId];
                      const vaultName = vault?.name || vaultId;
                      const assetType = vault?.assetType || '';
                      
                      if (!searchQuery) return true;
                      
                      const query = searchQuery.toLowerCase();
                      return (
                        vaultName.toLowerCase().includes(query) ||
                        assetType.toLowerCase().includes(query) ||
                        vaultId.toLowerCase().includes(query)
                      );
                    }).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No vaults found matching "{searchQuery}" {/*eslint-disable-line react/no-unescaped-entities*/}
                      </div>
                    )}
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Competitor toggle button */}
            {formData.vaultId && hasCompetitors && (
              <div className="grid gap-3">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={toggleCompetitors}
                  className="flex items-center justify-center gap-2"
                >
                  <BarChart2 className="h-4 w-4" />
                  {showCompetitors ? "Hide Other Yield Sources" : "Compare Other Yield Sources"}
                </Button>
                
                {/* Competitor selection with improved styling */}
                {showCompetitors && (
                  <div className="mt-2">
                    <Label htmlFor="competitor" className="mb-2 block">Other Yield Sources</Label>
                    <Select
                      value={selectedCompetitor === null ? "none" : selectedCompetitor}
                      onValueChange={(value) => handleCompetitorSelect(value)}
                    >
                      {/* Custom styled trigger to match vault selection */}
                      <SelectTrigger className="w-full justify-between">
                        {selectedCompetitor && selectedCompetitorInfo ? (
                          <div className="flex items-center gap-2">
                            <Image
                              src={selectedCompetitorInfo.image}
                              alt={selectedCompetitorInfo.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span>{selectedCompetitorInfo.name}</span>
                            {selectedCompetitorApy !== undefined ? (
                              <span className="ml-2 text-muted-foreground">
                                {selectedCompetitorApy.toFixed(2)}%
                              </span>
                            ) : loadingCompetitor ? (
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            ) : null}
                          </div>
                        ) : selectedCompetitor === null ? (
                          <span>None</span>
                        ) : (
                          <span>Select a comparison</span>
                        )}

                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <div className="flex items-center gap-2">
                            <span>None</span>
                          </div>
                        </SelectItem>
                        {availableCompetitors.map(competitorId => {
                          const competitor = competitorInfo[competitorId];
                          return (
                            <SelectItem key={competitorId} value={competitorId}>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={competitor.image}
                                  alt={competitor.name}
                                  width={20}
                                  height={20}
                                  className="rounded-full"
                                />
                                <span>{competitor.name}</span>
                                <span className="ml-2 text-muted-foreground">
                                  {loadingCompetitor && competitorAPY[competitorId] === undefined ? (
                                    <Loader2 className="h-4 w-4 inline ml-1 animate-spin" />
                                  ) : competitorAPY[competitorId] !== undefined ? (
                                    `${(competitorAPY[competitorId] * 100).toFixed(2)}%`
                                  ) : "Loading..."}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {!isSelectedVaultUSD && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="useUSD"
                  checked={formData.useUSD}
                  onCheckedChange={(checked) => handleChange("useUSD", checked)}
                />
                <Label htmlFor="useUSD">
                  Input in USD instead of native token
                </Label>
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="initialAmount">Initial Investment</Label>
              <div className="flex items-center">
                <Input
                  id="initialAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.initialAmount}
                  onChange={(e) => handleNumberInputChange(e, "initialAmount")}
                  className="w-full"
                />
                <span className="ml-2">
                  {formData.useUSD || isSelectedVaultUSD
                    ? "USD"
                    : vaultInfo[formData.vaultId]?.assetType || ""}
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
              <div className="flex items-center">
                <Input
                  id="monthlyContribution"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyContribution}
                  onChange={(e) => handleNumberInputChange(e, "monthlyContribution")}
                  className="w-full"
                />
                <span className="ml-2">
                  {formData.useUSD || isSelectedVaultUSD
                    ? "USD"
                    : vaultInfo[formData.vaultId]?.assetType || ""}
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="timeFrame">Time Frame</Label>
              <div className="flex gap-2">
                <Input
                  id="timeFrameValue"
                  type="number"
                  min="1"
                  value={formData.timeFrameValue}
                  onChange={(e) => handleNumberInputChange(e, "timeFrameValue")}
                  className="flex-1"
                />
                <Select
                  value={formData.timeFrameUnit}
                  onValueChange={(value: "months" | "years") =>
                    handleChange("timeFrameUnit", value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vault Opening Button */}
            {formData.networkId && formData.vaultId && (
              <div>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    const networkName = networkInfo[formData.networkId]?.name || formData.networkId;
                    let url = `https://app.goat.fi/vault/${networkName.toLowerCase()}/${formData.vaultId.toLowerCase()}`;
                    if (formData.vaultId === "stGOA") {
                      url = "https://app.goat.fi/stake";
                    }
                    window.open(url, '_blank');
                  }}
                >
                  Open Vault on Goat.fi
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
