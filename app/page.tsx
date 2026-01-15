"use client"

import { useState, useMemo } from "react"
import { ConfigPanel } from "@/components/config-panel"
import { StateDiagram } from "@/components/state-diagram"
import { StateTable } from "@/components/state-table"
import { TransitionTable } from "@/components/transition-table"
import { KarnaughMaps } from "@/components/karnaugh-maps"
import { GateCircuits } from "@/components/gate-circuits"
import { SchematicDiagram } from "@/components/schematic-diagram"
import { DownloadButton } from "@/components/download-button"
import { generateCounterData, type CounterConfig } from "@/lib/counter-logic"
import { Cpu, Zap } from "lucide-react"

export default function CounterDesigner() {
  const [config, setConfig] = useState<CounterConfig>({
    bits: 3,
    flipFlopType: "JK",
    countMode: "ascending",
    customSequence: [],
    resetState: undefined,
  })

  const [isGenerated, setIsGenerated] = useState(false)

  const counterData = useMemo(() => {
    if (!isGenerated) return null
    return generateCounterData(config)
  }, [config, isGenerated])

  const handleGenerate = (newConfig: CounterConfig) => {
    setConfig(newConfig)
    setIsGenerated(true)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Diseñador de Contadores Digitales</h1>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Herramienta para diseño de contadores síncronos con Flip-Flops
            </p>
          </div>

          <DownloadButton data={counterData} config={config} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Configuration Panel */}
        <div className="lg:col-span-3">
          <ConfigPanel onGenerate={handleGenerate} currentConfig={config} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* State Diagram */}
          <div className="md:col-span-2 lg:col-span-1">
            <StateDiagram data={counterData} config={config} />
          </div>

          {/* State Tables */}
          <div className="md:col-span-2 lg:col-span-1">
            <StateTable data={counterData} config={config} />
          </div>

          {/* Transition Table */}
          <div className="md:col-span-2">
            <TransitionTable data={counterData} config={config} />
          </div>

          {/* Karnaugh Maps */}
          <div className="md:col-span-2">
            <KarnaughMaps data={counterData} config={config} />
          </div>

          {/* Gate Logic Circuits */}
          <div className="md:col-span-2">
            <GateCircuits data={counterData} config={config} />
          </div>

          {/* Schematic Diagram */}
          <div className="md:col-span-2">
            <SchematicDiagram data={counterData} config={config} />
          </div>
        </div>
      </div>
    </div>
  )
}
