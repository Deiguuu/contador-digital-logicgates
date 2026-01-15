"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Grid3X3 } from "lucide-react"
import type { CounterData, CounterConfig } from "@/lib/counter-logic"

interface KarnaughMapsProps {
  data: CounterData | null
  config: CounterConfig
}

interface KMapGroup {
  cells: number[]
  color: string
}

export function KarnaughMaps({ data, config }: KarnaughMapsProps) {
  if (!data) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Grid3X3 className="w-5 h-5 text-primary" />
            Mapas de Karnaugh
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground text-center">Configure los parámetros y genere el contador</p>
        </CardContent>
      </Card>
    )
  }

  const getFlipFlopLabels = () => {
    const labels: string[] = []
    for (let i = config.bits - 1; i >= 0; i--) {
      labels.push(String.fromCharCode(65 + (config.bits - 1 - i)))
    }
    return labels
  }

  const labels = getFlipFlopLabels()

  const renderKMap = (kmap: (number | string)[][], inputName: string, groups: KMapGroup[], equation: string) => {
    const is4Var = config.bits === 4
    const is3Var = config.bits === 3

    const rowLabels = is4Var ? ["00", "01", "11", "10"] : is3Var ? ["0", "1"] : ["0", "1"]
    const colLabels = is4Var ? ["00", "01", "11", "10"] : is3Var ? ["00", "01", "11", "10"] : ["0", "1"]

    const rowVars = is4Var ? `${labels[0]}${labels[1]}` : is3Var ? labels[0] : labels[0]
    const colVars = is4Var ? `${labels[2]}${labels[3]}` : is3Var ? `${labels[1]}${labels[2]}` : labels[1]

    const getCellGroups = (row: number, col: number): KMapGroup[] => {
      const cellIndex = row * colLabels.length + col
      return groups.filter((g) => g.cells.includes(cellIndex))
    }

    return (
      <div className="p-3 rounded-lg bg-secondary/30 border border-border">
        <h4 className="text-sm font-mono font-bold text-chart-4 mb-3">{inputName}</h4>

        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr>
                <th className="px-1 py-1 text-muted-foreground font-mono text-[10px]">
                  {rowVars}\{colVars}
                </th>
                {colLabels.map((label) => (
                  <th key={label} className="px-2 py-1 text-center font-mono text-muted-foreground">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kmap.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="px-1 py-1 text-center font-mono text-muted-foreground">{rowLabels[rowIdx]}</td>
                  {row.map((cell, colIdx) => {
                    const cellGroups = getCellGroups(rowIdx, colIdx)
                    const hasGroup = cellGroups.length > 0
                    const groupColors = cellGroups.map((g) => g.color)

                    return (
                      <td
                        key={colIdx}
                        className={`px-2 py-2 text-center font-mono border border-border/50 min-w-[32px] transition-all ${
                          hasGroup ? "font-bold" : ""
                        }`}
                        style={{
                          backgroundColor: hasGroup ? `${groupColors[0]}20` : undefined,
                          boxShadow: hasGroup ? `inset 0 0 0 2px ${groupColors[0]}` : undefined,
                        }}
                      >
                        <span className={cell === "X" ? "text-muted-foreground" : "text-foreground"}>{cell}</span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Equation with overline notation */}
        <div className="mt-3 p-2 rounded bg-background/50 border border-border/50">
          <p className="text-xs">
            <span className="text-muted-foreground">Ecuación: </span>
            <span className="font-mono text-primary" dangerouslySetInnerHTML={{ __html: formatEquation(equation) }} />
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Grid3X3 className="w-5 h-5 text-primary" />
          Mapas de Karnaugh
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`grid gap-4 ${
            config.flipFlopType === "JK" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {data.karnaughMaps.map((kmap, i) => (
            <div key={i}>{renderKMap(kmap.map, kmap.inputName, kmap.groups, kmap.equation)}</div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
          <h4 className="text-xs font-medium text-foreground mb-2">Leyenda de Agrupaciones</h4>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded border-2"
                style={{ borderColor: "#22c55e", backgroundColor: "#22c55e20" }}
              ></div>
              <span className="text-muted-foreground">Grupo de 8</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded border-2"
                style={{ borderColor: "#3b82f6", backgroundColor: "#3b82f620" }}
              ></div>
              <span className="text-muted-foreground">Grupo de 4</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded border-2"
                style={{ borderColor: "#f59e0b", backgroundColor: "#f59e0b20" }}
              ></div>
              <span className="text-muted-foreground">Grupo de 2</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded border-2"
                style={{ borderColor: "#ef4444", backgroundColor: "#ef444420" }}
              ></div>
              <span className="text-muted-foreground">Grupo de 1</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatEquation(equation: string): string {
  // Format negated variables with overline
  return equation
    .replace(/([A-Z])'/g, '<span style="text-decoration: overline">$1</span>')
    .replace(/\+/g, " + ")
    .replace(/·/g, "·")
}
