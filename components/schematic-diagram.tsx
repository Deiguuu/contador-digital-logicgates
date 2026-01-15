"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu } from "lucide-react"
import type { CounterData, CounterConfig } from "@/lib/counter-logic"

interface SchematicDiagramProps {
  data: CounterData | null
  config: CounterConfig
}

export function SchematicDiagram({ data, config }: SchematicDiagramProps) {
  if (!data) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Cpu className="w-5 h-5 text-primary" />
            Diagrama Esquemático Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
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
  const ffWidth = 90
  const ffHeight = 140
  const ffSpacing = 160
  const startX = 150
  const startY = 280
  const gateAreaHeight = 180

  const svgWidth = startX + config.bits * ffSpacing + 120
  const svgHeight = startY + ffHeight + 80

  const parseEquation = (expression: string) => {
    if (expression === "0") return { terms: [], isZero: true, isOne: false }
    if (expression === "1") return { terms: [{ variables: [] }], isZero: false, isOne: true }

    const termStrings = expression.split("+").map((t) => t.trim())
    const terms = termStrings.map((termStr) => {
      const variables: { name: string; negated: boolean }[] = []
      const parts = termStr.split("·")
      parts.forEach((part) => {
        const trimmed = part.trim()
        if (trimmed.endsWith("'")) {
          variables.push({ name: trimmed.slice(0, -1), negated: true })
        } else if (trimmed.length > 0) {
          variables.push({ name: trimmed, negated: false })
        }
      })
      return { variables }
    })
    return { terms, isZero: false, isOne: false }
  }

  const renderFlipFlop = (label: string, index: number) => {
    const x = startX + index * ffSpacing
    const y = startY

    return (
      <g key={label}>
        {/* FF Box */}
        <rect
          x={x}
          y={y}
          width={ffWidth}
          height={ffHeight}
          fill="currentColor"
          className="text-secondary"
          stroke="currentColor"
          strokeWidth="2"
          style={{ stroke: "hsl(var(--primary))" }}
          rx="4"
        />

        {/* FF Type Label */}
        <text x={x + ffWidth / 2} y={y + 22} textAnchor="middle" className="fill-primary text-sm font-bold">
          {config.flipFlopType}
        </text>

        {/* FF Name */}
        <text x={x + ffWidth / 2} y={y + 42} textAnchor="middle" className="fill-foreground text-xs font-mono">
          FF-{label}
        </text>

        {/* Inputs based on FF type */}
        {config.flipFlopType === "JK" && (
          <>
            <text x={x + 12} y={y + 65} className="fill-chart-4 text-[11px] font-mono font-bold">
              J
            </text>
            <line
              x1={x}
              y1={y + 60}
              x2={x - 30}
              y2={y + 60}
              stroke="currentColor"
              className="text-chart-4"
              strokeWidth="2"
            />

            <text x={x + 12} y={y + 95} className="fill-chart-4 text-[11px] font-mono font-bold">
              K
            </text>
            <line
              x1={x}
              y1={y + 90}
              x2={x - 30}
              y2={y + 90}
              stroke="currentColor"
              className="text-chart-4"
              strokeWidth="2"
            />
          </>
        )}

        {config.flipFlopType === "T" && (
          <>
            <text x={x + 12} y={y + 78} className="fill-chart-4 text-[11px] font-mono font-bold">
              T
            </text>
            <line
              x1={x}
              y1={y + 73}
              x2={x - 30}
              y2={y + 73}
              stroke="currentColor"
              className="text-chart-4"
              strokeWidth="2"
            />
          </>
        )}

        {config.flipFlopType === "D" && (
          <>
            <text x={x + 12} y={y + 78} className="fill-chart-4 text-[11px] font-mono font-bold">
              D
            </text>
            <line
              x1={x}
              y1={y + 73}
              x2={x - 30}
              y2={y + 73}
              stroke="currentColor"
              className="text-chart-4"
              strokeWidth="2"
            />
          </>
        )}

        {/* Clock input */}
        <polygon
          points={`${x},${y + 115} ${x + 12},${y + 122} ${x},${y + 129}`}
          fill="currentColor"
          className="text-chart-2"
        />
        <text x={x + 15} y={y + 126} className="fill-chart-2 text-[10px] font-mono">
          CLK
        </text>

        {/* Outputs */}
        <text x={x + ffWidth - 20} y={y + 65} className="fill-primary text-[11px] font-mono font-bold">
          Q
        </text>
        <line
          x1={x + ffWidth}
          y1={y + 60}
          x2={x + ffWidth + 40}
          y2={y + 60}
          stroke="currentColor"
          className="text-primary"
          strokeWidth="2"
        />

        <text x={x + ffWidth - 20} y={y + 95} className="fill-muted-foreground text-[11px] font-mono">
          Q̄
        </text>
        <line
          x1={x + ffWidth}
          y1={y + 90}
          x2={x + ffWidth + 25}
          y2={y + 90}
          stroke="currentColor"
          className="text-muted-foreground"
          strokeWidth="1.5"
        />

        {/* Output label */}
        <text x={x + ffWidth + 45} y={y + 65} className="fill-primary text-xs font-mono font-bold">
          Q
          <tspan baselineShift="sub" fontSize="9">
            {label}
          </tspan>
        </text>
      </g>
    )
  }

  const renderGateLogic = (
    equation: { input: string; expression: string },
    eqIndex: number,
    ffIndex: number,
    isK = false,
  ) => {
    const parsed = parseEquation(equation.expression)
    const x = startX + ffIndex * ffSpacing - 30
    const baseY = isK ? startY + 90 : config.flipFlopType === "JK" ? startY + 60 : startY + 73
    const gateY = startY - gateAreaHeight + eqIndex * 35 + 30

    if (parsed.isZero) {
      return (
        <g key={`gate-${eqIndex}`}>
          <line x1={x} y1={baseY} x2={x} y2={gateY} stroke="currentColor" className="text-chart-4" strokeWidth="1.5" />
          <line
            x1={x}
            y1={gateY}
            x2={40}
            y2={gateY}
            stroke="currentColor"
            className="text-muted-foreground"
            strokeWidth="1.5"
          />
          <text x="15" y={gateY + 4} className="fill-muted-foreground text-[9px] font-mono">
            GND
          </text>
        </g>
      )
    }

    if (parsed.isOne) {
      return (
        <g key={`gate-${eqIndex}`}>
          <line x1={x} y1={baseY} x2={x} y2={gateY} stroke="currentColor" className="text-chart-4" strokeWidth="1.5" />
          <line x1={x} y1={gateY} x2={40} y2={gateY} stroke="currentColor" className="text-chart-2" strokeWidth="1.5" />
          <text x="15" y={gateY + 4} className="fill-chart-2 text-[9px] font-mono">
            VCC
          </text>
        </g>
      )
    }

    const numTerms = parsed.terms.length
    const gateWidth = numTerms > 1 ? 70 : 45
    const andX = 80
    const orX = andX + 50

    return (
      <g key={`gate-${eqIndex}`}>
        {/* Connection from FF input to gate area */}
        <line x1={x} y1={baseY} x2={x} y2={gateY} stroke="currentColor" className="text-chart-4" strokeWidth="1.5" />

        {numTerms === 1 && parsed.terms[0].variables.length === 1 ? (
          // Single variable - possibly with NOT gate
          <g>
            {parsed.terms[0].variables[0].negated ? (
              <>
                {/* NOT gate */}
                <polygon
                  points={`${andX},${gateY - 8} ${andX},${gateY + 8} ${andX + 16},${gateY}`}
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-5"
                  strokeWidth="1.5"
                />
                <circle
                  cx={andX + 20}
                  cy={gateY}
                  r="4"
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-5"
                  strokeWidth="1.5"
                />
                <line
                  x1={andX + 24}
                  y1={gateY}
                  x2={x}
                  y2={gateY}
                  stroke="currentColor"
                  className="text-chart-4"
                  strokeWidth="1.5"
                />
                <line
                  x1={40}
                  y1={gateY}
                  x2={andX}
                  y2={gateY}
                  stroke="currentColor"
                  className="text-chart-3"
                  strokeWidth="1.5"
                />
                <text x="15" y={gateY + 4} className="fill-foreground text-[9px] font-mono">
                  {parsed.terms[0].variables[0].name}
                </text>
              </>
            ) : (
              <>
                <line
                  x1={40}
                  y1={gateY}
                  x2={x}
                  y2={gateY}
                  stroke="currentColor"
                  className="text-chart-3"
                  strokeWidth="1.5"
                />
                <text x="15" y={gateY + 4} className="fill-foreground text-[9px] font-mono">
                  {parsed.terms[0].variables[0].name}
                </text>
              </>
            )}
          </g>
        ) : numTerms === 1 ? (
          // Single term with AND gate
          <g>
            {/* AND gate */}
            <path
              d={`M ${andX} ${gateY - 12} L ${andX} ${gateY + 12} L ${andX + 12} ${gateY + 12} A 12 12 0 0 0 ${andX + 12} ${gateY - 12} Z`}
              fill="none"
              stroke="currentColor"
              className="text-chart-2"
              strokeWidth="1.5"
            />
            <line
              x1={andX + 24}
              y1={gateY}
              x2={x}
              y2={gateY}
              stroke="currentColor"
              className="text-chart-4"
              strokeWidth="1.5"
            />

            {/* Input lines */}
            {parsed.terms[0].variables.map((v, i) => {
              const inputY = gateY - 6 + i * 6
              return (
                <g key={`input-${i}`}>
                  <line
                    x1={40}
                    y1={inputY}
                    x2={andX}
                    y2={inputY}
                    stroke="currentColor"
                    className="text-chart-3"
                    strokeWidth="1"
                  />
                </g>
              )
            })}
            <text x="15" y={gateY + 4} className="fill-foreground text-[8px] font-mono">
              {parsed.terms[0].variables.map((v) => (v.negated ? `${v.name}'` : v.name)).join("·")}
            </text>
          </g>
        ) : (
          // Multiple terms with AND + OR gates
          <g>
            {/* OR gate */}
            <path
              d={`M ${orX} ${gateY - 12} Q ${orX + 6} ${gateY} ${orX} ${gateY + 12} Q ${orX + 15} ${gateY + 12} ${orX + 25} ${gateY} Q ${orX + 15} ${gateY - 12} ${orX} ${gateY - 12} Z`}
              fill="none"
              stroke="currentColor"
              className="text-chart-1"
              strokeWidth="1.5"
            />
            <line
              x1={orX + 25}
              y1={gateY}
              x2={x}
              y2={gateY}
              stroke="currentColor"
              className="text-chart-4"
              strokeWidth="1.5"
            />

            {/* AND gates for each term */}
            {parsed.terms.slice(0, 3).map((term, tIdx) => {
              const termY = gateY - 8 + tIdx * 8
              return (
                <g key={`term-${tIdx}`}>
                  <rect
                    x={andX - 5}
                    y={termY - 4}
                    width={18}
                    height={8}
                    rx="1"
                    fill="none"
                    stroke="currentColor"
                    className="text-chart-2"
                    strokeWidth="1"
                  />
                  <line
                    x1={andX + 13}
                    y1={termY}
                    x2={orX + 3}
                    y2={termY}
                    stroke="currentColor"
                    className="text-chart-2"
                    strokeWidth="1"
                  />
                  <line
                    x1={40}
                    y1={termY}
                    x2={andX - 5}
                    y2={termY}
                    stroke="currentColor"
                    className="text-chart-3"
                    strokeWidth="1"
                  />
                </g>
              )
            })}
            <text x="10" y={gateY + 4} className="fill-foreground text-[7px] font-mono">
              {equation.expression.substring(0, 12)}
              {equation.expression.length > 12 ? "..." : ""}
            </text>
          </g>
        )}
      </g>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Cpu className="w-5 h-5 text-primary" />
          Diagrama Esquemático Completo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[600px]">
            {/* Title */}
            <text x={svgWidth / 2} y={30} textAnchor="middle" className="fill-foreground text-lg font-bold">
              Contador {config.bits} bits - {config.flipFlopType} Flip-Flop
            </text>
            <text x={svgWidth / 2} y={50} textAnchor="middle" className="fill-muted-foreground text-xs">
              {config.countMode === "ascending"
                ? "Ascendente"
                : config.countMode === "descending"
                  ? "Descendente"
                  : "Personalizado"}
            </text>

            {/* Combinational Logic Area */}
            <rect
              x={35}
              y={startY - gateAreaHeight - 10}
              width={startX + (config.bits - 1) * ffSpacing + ffWidth - 20}
              height={gateAreaHeight}
              fill="currentColor"
              className="text-secondary/30"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4"
              style={{ stroke: "hsl(var(--border))" }}
              rx="8"
            />
            <text x={45} y={startY - gateAreaHeight + 5} className="fill-foreground text-xs font-medium">
              Lógica Combinacional
            </text>

            {data.equations.map((eq, eqIdx) => {
              const ffIndex = Math.floor(eqIdx / (config.flipFlopType === "JK" ? 2 : 1))
              const isK = config.flipFlopType === "JK" && eqIdx % 2 === 1
              return renderGateLogic(eq, eqIdx, ffIndex, isK)
            })}

            {/* Clock line */}
            <line
              x1={50}
              y1={startY + 122}
              x2={startX + (config.bits - 1) * ffSpacing + 12}
              y2={startY + 122}
              stroke="currentColor"
              className="text-chart-2"
              strokeWidth="2"
            />

            {/* Clock symbol */}
            <rect
              x={15}
              y={startY + 110}
              width={30}
              height={24}
              fill="none"
              stroke="currentColor"
              className="text-chart-2"
              strokeWidth="1.5"
              rx="2"
            />
            <path
              d={`M 20 ${startY + 122} L 27 ${startY + 116} L 34 ${startY + 122} L 41 ${startY + 128}`}
              fill="none"
              stroke="currentColor"
              className="text-chart-2"
              strokeWidth="1.5"
            />
            <text x="18" y={startY + 145} className="fill-chart-2 text-[10px] font-mono">
              CLK
            </text>

            {/* Flip-Flops */}
            {labels.map((label, i) => renderFlipFlop(label, i))}

            {/* Feedback lines */}
            {labels.map((label, i) => {
              const x = startX + i * ffSpacing + ffWidth + 40
              const feedbackY = startY - gateAreaHeight - 30 - i * 8
              return (
                <g key={`feedback-${i}`}>
                  <line
                    x1={x}
                    y1={startY + 60}
                    x2={x}
                    y2={feedbackY}
                    stroke="currentColor"
                    className="text-primary/60"
                    strokeWidth="1.5"
                    strokeDasharray="4"
                  />
                  <line
                    x1={x}
                    y1={feedbackY}
                    x2={35}
                    y2={feedbackY}
                    stroke="currentColor"
                    className="text-primary/60"
                    strokeWidth="1.5"
                    strokeDasharray="4"
                  />
                  <circle cx={35} cy={feedbackY} r="3" fill="currentColor" className="text-primary" />
                  <text x={20} y={feedbackY + 4} className="fill-primary text-[9px] font-mono">
                    Q{label}
                  </text>
                </g>
              )
            })}

            {/* Output section */}
            <rect
              x={svgWidth - 80}
              y={startY + 30}
              width={65}
              height={30 + config.bits * 18}
              fill="currentColor"
              className="text-secondary/50"
              stroke="currentColor"
              strokeWidth="1"
              style={{ stroke: "hsl(var(--border))" }}
              rx="4"
            />
            <text x={svgWidth - 65} y={startY + 50} className="fill-foreground text-xs font-medium">
              Salida
            </text>
            {labels.map((label, i) => (
              <text
                key={`out-${label}`}
                x={svgWidth - 60}
                y={startY + 70 + i * 18}
                className="fill-primary text-xs font-mono font-bold"
              >
                Q{label}
              </text>
            ))}
          </svg>
        </div>

        {/* Equations Summary */}
        <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Ecuaciones de Entrada (Implementadas)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
            {data.equations.map((eq, i) => (
              <div key={i} className="text-muted-foreground flex items-center gap-2">
                <span className="text-chart-4 font-bold">{eq.input}</span>
                <span className="text-foreground">=</span>
                <span className="text-primary" dangerouslySetInnerHTML={{ __html: formatEquation(eq.expression) }} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatEquation(equation: string): string {
  return equation.replace(/([A-Z])'/g, '<span style="text-decoration: overline">$1</span>').replace(/\+/g, " + ")
}
