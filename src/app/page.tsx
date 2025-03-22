"use client"

import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import InvestmentForm from "@/components/investment-form"
import InvestmentChart from "@/components/investment-chart"
import { SimulationResult } from "@/lib/types"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import Image from "next/image"

export default function Home() {
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([])
  const [direction, setDirection] = useState<"vertical" | "horizontal">("horizontal")

  // Handle responsive direction change based on screen width
  useEffect(() => {
    const handleResize = () => {
      setDirection(window.innerWidth >= 768 ? "horizontal" : "vertical")
    }
    
    // Set initial direction
    handleResize()
    
    // Add event listener for window resize
    window.addEventListener("resize", handleResize)
    
    // Clean up event listener
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="w-full py-4" suppressHydrationWarning>
      <div className="w-full max-w-[90%] md:max-w-[90%] mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Image src="/icon.svg" alt="GoatFi" width={36} height={36} />
          <h1 className="text-3xl font-bold tracking-tight">GOAT Simulator</h1>
        </div>
        {direction === "vertical" ? (
          // Mobile view with fixed heights and single scroll
          <div className="space-y-4">
            <div className="h-[70vh]">
              <h2 className="text-xl font-semibold mb-4">Investment Parameters</h2>
              <Separator className="my-4" />
              <InvestmentForm onCalculate={setSimulationResults} />
            </div>
            <div className="h-[90vh]">
              <h2 className="text-xl font-semibold mb-4">Projection Results</h2>
              <Separator className="my-4" />
              <InvestmentChart results={simulationResults} />
            </div>
          </div>
        ) : (
          // Desktop view with resizable panels
          <ResizablePanelGroup 
            direction="horizontal"
            className="min-h-[80vh]"
          >
            <ResizablePanel defaultSize={25} minSize={20} className="md:min-h-0">
              <div className="p-4 md:p-6 h-full overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Investment Parameters</h2>
                <Separator className="my-4" />
                <InvestmentForm onCalculate={setSimulationResults} />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={75}>
              <div className="p-4 md:p-6 h-full overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Projection Results</h2>
                <Separator className="my-4" />
                <InvestmentChart results={simulationResults} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  )
}
