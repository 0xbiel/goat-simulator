"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApyData, fetchPriceData } from "@/lib/api";
import {
  networkInfo,
  vaultInfo,
  calculateInvestmentGrowth,
} from "@/lib/helpers";
import { ApiResponse, SimulationResult, FormData } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface InvestmentFormProps {
  onCalculate: (results: SimulationResult[]) => void;
}

export default function InvestmentForm({ onCalculate }: InvestmentFormProps) {
  // Use null initial state and client-side initialization to avoid hydration mismatch
  const [loading, setLoading] = useState(true);
  const [apyData, setApyData] = useState<ApiResponse | null>(null);

  const [formData, setFormData] = useState<FormData | null>(null);
  const dataFetchedRef = useRef(false);

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

    setFormData((prev) => ({ ...prev!, [name]: value }));

    // If network changes, update vaultId to first vault in that network
    if (name === "networkId" && apyData) {
      const firstVaultId = Object.keys(apyData.data[value as string])[0];
      setFormData((prev) => ({
        ...prev!,
        networkId: value as string,
        vaultId: firstVaultId,
      }));
    }
  };

  // Auto-calculate whenever form data changes
  useEffect(() => {
    if (!apyData || !formData?.networkId || !formData?.vaultId) return;

    const apy = Number(apyData.data[formData.networkId][formData.vaultId]);

    let result;

    if (formData.useUSD && !vaultInfo[formData.vaultId]?.isUSD) {
      // If using USD and vault is also USD, set initial amount to 0

      result = calculateInvestmentGrowth(formData, apy, "USD");
    } else {
      result = calculateInvestmentGrowth(formData, apy);
    }
    // Calculate simulation results

    // Pass results to parent component only if result is not null
    if (result) {
      onCalculate([result]);
    }
  }, [formData, apyData, onCalculate]);

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
              <Select
                disabled={!formData.networkId}
                value={formData.vaultId}
                onValueChange={(value) => handleChange("vaultId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Vault" />
                </SelectTrigger>
                <SelectContent>
                  {formData.networkId &&
                    apyData &&
                    Object.keys(apyData.data[formData.networkId]).map(
                      (vaultId) => (
                        <SelectItem key={vaultId} value={vaultId}>
                          <div className="flex items-center gap-2">
                            {vaultInfo[vaultId] && (
                              <Image
                                src={vaultInfo[vaultId].image}
                                alt={vaultInfo[vaultId].name}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            )}
                            {vaultInfo[vaultId]?.name || vaultId} -
                            {(
                              Number(
                                apyData.data[formData.networkId][vaultId],
                              ) * 100
                            ).toFixed(2)}
                            %
                          </div>
                        </SelectItem>
                      ),
                    )}
                </SelectContent>
              </Select>
            </div>

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
                  onChange={(e) =>
                    handleChange("initialAmount", Number(e.target.value))
                  }
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
                  onChange={(e) =>
                    handleChange("monthlyContribution", Number(e.target.value))
                  }
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
                  onChange={(e) =>
                    handleChange("timeFrameValue", Number(e.target.value))
                  }
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
