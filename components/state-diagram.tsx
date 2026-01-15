"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch } from "lucide-react"
import type { CounterData, CounterConfig } from "@/lib/counter-logic"

interface StateDiagramProps {
  data: CounterData | null
  config: CounterConfig
}

export function StateDiagram({ data, config }: StateDiagramProps) {
  if (!data) {
    return (
      <Card className="bg-card border-border h-full min-h-[300px]">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <GitBranch className="w-5 h-5 text-primary" />
            Diagrama de Estados
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-center">Configure los parámetros y genere el contador</p>
        </CardContent>
      </Card>
    )
  }

  const sequence = data.sequence
  const n = sequence.length
  const centerX = 180
  const centerY = 150
  const radius = Math.min(100, 60 + n * 8)

  const { resetInfo } = data
  const resetStateIndex = sequence.indexOf(resetInfo.resetState)
  const isResetInSequence = resetStateIndex !== -1

  const getNodePosition = (index: number) => {
    const angle = (2 * Math.PI * index) / n - Math.PI / 2
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  }

  const getArrowPath = (from: number, to: number, isReset = false) => {
    const fromPos = getNodePosition(from)
    const toPos = getNodePosition(to)

    const dx = toPos.x - fromPos.x
    const dy = toPos.y - fromPos.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    const nodeRadius = 22
    const startX = fromPos.x + (dx / dist) * nodeRadius
    const startY = fromPos.y + (dy / dist) * nodeRadius
    const endX = toPos.x - (dx / dist) * (nodeRadius + 5)
    const endY = toPos.y - (dy / dist) * (nodeRadius + 5)

    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2

    const curveFactor = isReset ? 35 : 20
    const perpX = (-dy / dist) * curveFactor
    const perpY = (dx / dist) * curveFactor

    return `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`
  }

  const getExternalResetPosition = () => {
    return {
      x: centerX,
      y: centerY + radius + 60,
    }
  }

  const getExternalResetArrowPath = () => {
    const lastPos = getNodePosition(n - 1)
    const resetPos = getExternalResetPosition()

    const dx = resetPos.x - lastPos.x
    const dy = resetPos.y - lastPos.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    const nodeRadius = 22
    const startX = lastPos.x + (dx / dist) * nodeRadius
    const startY = lastPos.y + (dy / dist) * nodeRadius
    const endX = resetPos.x - (dx / dist) * (nodeRadius + 5)
    const endY = resetPos.y - (dy / dist) * (nodeRadius + 5)

    return `M ${startX} ${startY} L ${endX} ${endY}`
  }

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <GitBranch className="w-5 h-5 text-primary" />
          Diagrama de Estados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 360 340" className="w-full h-auto">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-primary" />
            </marker>
            <marker id="arrowhead-reset" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-amber-500" />
            </marker>
          </defs>

          {/* Regular Arrows (not including last transition if custom reset) */}
          {sequence.map((_, i) => {
            const isLastTransition = i === n - 1
            const targetIndex = isLastTransition ? resetStateIndex : (i + 1) % n

            // Skip last arrow if reset state is not in sequence
            if (isLastTransition && !isResetInSequence) return null

            const isResetArrow = isLastTransition && resetInfo.isCustomReset

            return (
              <path
                key={`arrow-${i}`}
                d={getArrowPath(i, targetIndex, isResetArrow)}
                fill="none"
                stroke="currentColor"
                strokeWidth={isResetArrow ? 2.5 : 2}
                strokeDasharray={isResetArrow ? "6,3" : "none"}
                className={isResetArrow ? "text-amber-500" : "text-primary/60"}
                markerEnd={isResetArrow ? "url(#arrowhead-reset)" : "url(#arrowhead)"}
              />
            )
          })}

          {resetInfo.isCustomReset && !isResetInSequence && (
            <path
              d={getExternalResetArrowPath()}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="6,3"
              className="text-amber-500"
              markerEnd="url(#arrowhead-reset)"
            />
          )}

          {/* Nodes */}
          {sequence.map((state, i) => {
            const pos = getNodePosition(i)
            const binary = state.toString(2).padStart(config.bits, "0")
            const isResetTarget = state === resetInfo.resetState && resetInfo.isCustomReset
            return (
              <g key={`node-${i}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="22"
                  fill="currentColor"
                  className={isResetTarget ? "text-amber-500/20" : "text-secondary"}
                  stroke={isResetTarget ? "var(--color-amber-500)" : "var(--primary)"}
                  strokeWidth={isResetTarget ? 3 : 2}
                />
                <text x={pos.x} y={pos.y - 4} textAnchor="middle" className="fill-foreground text-sm font-bold">
                  {state}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 10}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] font-mono"
                >
                  {binary}
                </text>
                {isResetTarget && (
                  <g>
                    <circle cx={pos.x + 18} cy={pos.y - 18} r="8" fill="var(--color-amber-500)" />
                    <text x={pos.x + 18} y={pos.y - 14} textAnchor="middle" className="fill-black text-[8px] font-bold">
                      R
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {resetInfo.isCustomReset && !isResetInSequence && (
            <g>
              {(() => {
                const pos = getExternalResetPosition()
                const binary = resetInfo.resetState.toString(2).padStart(config.bits, "0")
                return (
                  <>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="22"
                      fill="currentColor"
                      className="text-amber-500/20"
                      stroke="var(--color-amber-500)"
                      strokeWidth="3"
                    />
                    <text x={pos.x} y={pos.y - 4} textAnchor="middle" className="fill-foreground text-sm font-bold">
                      {resetInfo.resetState}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 10}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px] font-mono"
                    >
                      {binary}
                    </text>
                    <circle cx={pos.x + 18} cy={pos.y - 18} r="8" fill="var(--color-amber-500)" />
                    <text x={pos.x + 18} y={pos.y - 14} textAnchor="middle" className="fill-black text-[8px] font-bold">
                      R
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 38}
                      textAnchor="middle"
                      className="fill-amber-500 text-[10px] font-medium"
                    >
                      Estado de Reinicio
                    </text>
                  </>
                )
              })()}
            </g>
          )}

          {/* Start indicator */}
          <g>
            <path
              d={`M ${centerX - radius - 50} ${centerY - 60} L ${getNodePosition(0).x - 28} ${getNodePosition(0).y - 10}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-chart-2"
              markerEnd="url(#arrowhead)"
            />
            <text x={centerX - radius - 55} y={centerY - 65} className="fill-chart-2 text-xs">
              Inicio
            </text>
          </g>
        </svg>

        <div className="mt-4 space-y-2">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Secuencia:</strong>{" "}
              <span className="font-mono">
                {sequence.join(" → ")} → {resetInfo.resetState}
              </span>
            </p>
          </div>

          {resetInfo.isCustomReset && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-xs text-amber-500">
                <strong>Reinicio personalizado:</strong> Después del estado{" "}
                <span className="font-mono font-bold">{resetInfo.lastState}</span>, el ciclo reinicia al estado{" "}
                <span className="font-mono font-bold">{resetInfo.resetState}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
