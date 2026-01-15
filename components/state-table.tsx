"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table } from "lucide-react"
import type { CounterData, CounterConfig } from "@/lib/counter-logic"

interface StateTableProps {
  data: CounterData | null
  config: CounterConfig
}

export function StateTable({ data, config }: StateTableProps) {
  const getFlipFlopLabels = () => {
    const labels: string[] = []
    for (let i = config.bits - 1; i >= 0; i--) {
      labels.push(String.fromCharCode(65 + (config.bits - 1 - i)))
    }
    return labels
  }

  if (!data) {
    return (
      <Card className="bg-card border-border h-full min-h-[300px]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Table className="w-5 h-5 text-primary" />
            Tablas de Estado
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-center">Configure los parámetros y genere el contador</p>
        </CardContent>
      </Card>
    )
  }

  const labels = getFlipFlopLabels()

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Table className="w-5 h-5 text-primary" />
          Tablas de Estado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Present State Table */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Estado Presente (Q)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-2 py-2 text-left text-muted-foreground">#</th>
                    <th className="px-2 py-2 text-left text-muted-foreground">Dec</th>
                    {labels.map((label) => (
                      <th key={label} className="px-2 py-2 text-center font-mono text-primary">
                        Q<sub>{label}</sub>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.stateTable.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-2 py-2 text-muted-foreground">{i}</td>
                      <td className="px-2 py-2 font-mono text-foreground">{row.present}</td>
                      {row.presentBits.map((bit, j) => (
                        <td key={j} className="px-2 py-2 text-center font-mono text-foreground">
                          {bit}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Future State Table */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Estado Futuro (Q+)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-2 py-2 text-left text-muted-foreground">#</th>
                    <th className="px-2 py-2 text-left text-muted-foreground">Dec</th>
                    {labels.map((label) => (
                      <th key={label} className="px-2 py-2 text-center font-mono text-chart-2">
                        Q<sub>{label}</sub>
                        <sup>+</sup>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.stateTable.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-2 py-2 text-muted-foreground">{i}</td>
                      <td className="px-2 py-2 font-mono text-foreground">{row.next}</td>
                      {row.nextBits.map((bit, j) => (
                        <td key={j} className="px-2 py-2 text-center font-mono text-foreground">
                          {bit}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
