"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightLeft } from "lucide-react"
import type { CounterData, CounterConfig } from "@/lib/counter-logic"

interface TransitionTableProps {
  data: CounterData | null
  config: CounterConfig
}

export function TransitionTable({ data, config }: TransitionTableProps) {
  const getFlipFlopLabels = () => {
    const labels: string[] = []
    for (let i = config.bits - 1; i >= 0; i--) {
      labels.push(String.fromCharCode(65 + (config.bits - 1 - i)))
    }
    return labels
  }

  const getInputHeaders = () => {
    const labels = getFlipFlopLabels()
    if (config.flipFlopType === "JK") {
      return labels.flatMap((l) => [`J${l}`, `K${l}`])
    } else if (config.flipFlopType === "T") {
      return labels.map((l) => `T${l}`)
    } else {
      return labels.map((l) => `D${l}`)
    }
  }

  if (!data) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Tabla de Transición
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <p className="text-muted-foreground text-center">Configure los parámetros y genere el contador</p>
        </CardContent>
      </Card>
    )
  }

  const labels = getFlipFlopLabels()
  const inputHeaders = getInputHeaders()

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          Tabla de Transición ({config.flipFlopType})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-2 py-2 text-muted-foreground">#</th>
                {labels.map((label) => (
                  <th key={`q-${label}`} className="px-2 py-2 text-center font-mono text-primary">
                    Q<sub>{label}</sub>
                  </th>
                ))}
                {labels.map((label) => (
                  <th key={`qn-${label}`} className="px-2 py-2 text-center font-mono text-chart-2">
                    Q<sub>{label}</sub>
                    <sup>+</sup>
                  </th>
                ))}
                {inputHeaders.map((header, i) => (
                  <th key={header} className="px-2 py-2 text-center font-mono text-chart-4">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.transitionTable.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-2 py-2 text-muted-foreground">{i}</td>
                  {row.presentBits.map((bit, j) => (
                    <td key={`p-${j}`} className="px-2 py-2 text-center font-mono text-foreground">
                      {bit}
                    </td>
                  ))}
                  {row.nextBits.map((bit, j) => (
                    <td key={`n-${j}`} className="px-2 py-2 text-center font-mono text-foreground">
                      {bit}
                    </td>
                  ))}
                  {row.inputs.map((input, j) => (
                    <td key={`i-${j}`} className="px-2 py-2 text-center font-mono text-chart-4">
                      {input === "X" ? <span className="text-muted-foreground">X</span> : input}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Transition Table Reference */}
        <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
          <h4 className="text-xs font-medium text-foreground mb-2">Tabla de Excitación {config.flipFlopType}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            {config.flipFlopType === "JK" && (
              <>
                <div className="text-muted-foreground">0→0: J=0, K=X</div>
                <div className="text-muted-foreground">0→1: J=1, K=X</div>
                <div className="text-muted-foreground">1→0: J=X, K=1</div>
                <div className="text-muted-foreground">1→1: J=X, K=0</div>
              </>
            )}
            {config.flipFlopType === "T" && (
              <>
                <div className="text-muted-foreground">0→0: T=0</div>
                <div className="text-muted-foreground">0→1: T=1</div>
                <div className="text-muted-foreground">1→0: T=1</div>
                <div className="text-muted-foreground">1→1: T=0</div>
              </>
            )}
            {config.flipFlopType === "D" && (
              <>
                <div className="text-muted-foreground">0→0: D=0</div>
                <div className="text-muted-foreground">0→1: D=1</div>
                <div className="text-muted-foreground">1→0: D=0</div>
                <div className="text-muted-foreground">1→1: D=1</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
