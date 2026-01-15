"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch } from "lucide-react"
import type { CounterData, CounterConfig } from "@/lib/counter-logic"

interface GateCircuitsProps {
  data: CounterData | null
  config: CounterConfig
}

interface ParsedTerm {
  variables: { name: string; negated: boolean }[]
}

interface ParsedEquation {
  inputName: string
  terms: ParsedTerm[]
  isZero: boolean
  isOne: boolean
}

export function GateCircuits({ data, config }: GateCircuitsProps) {
  if (!data) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <GitBranch className="w-5 h-5 text-primary" />
            Circuitos de Compuertas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground text-center">Configure los parámetros y genere el contador</p>
        </CardContent>
      </Card>
    )
  }

  const parseEquation = (inputName: string, expression: string): ParsedEquation => {
    if (expression === "0") return { inputName, terms: [], isZero: true, isOne: false }
    if (expression === "1") return { inputName, terms: [{ variables: [] }], isZero: false, isOne: true }

    const termStrings = expression.split("+").map((t) => t.trim())
    const terms: ParsedTerm[] = termStrings.map((termStr) => {
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

    return { inputName, terms, isZero: false, isOne: false }
  }

  const parsedEquations = data.equations.map((eq) => parseEquation(eq.input, eq.expression))

  const renderGateCircuit = (parsed: ParsedEquation, index: number) => {
    const { inputName, terms, isZero, isOne } = parsed

    // Calculate dimensions based on complexity
    const numTerms = terms.length
    const maxVarsPerTerm = Math.max(...terms.map((t) => t.variables.length), 1)

    const svgWidth = 450
    const svgHeight = Math.max(180, numTerms * 70 + 60)

    const inputX = 30
    const notGateX = 80
    const andGateX = 200
    const orGateX = 340
    const outputX = 420

    // Get all unique variables
    const allVariables: { name: string; negated: boolean }[] = []
    terms.forEach((term) => {
      term.variables.forEach((v) => {
        if (!allVariables.find((av) => av.name === v.name && av.negated === v.negated)) {
          allVariables.push(v)
        }
      })
    })

    const uniqueVarNames = [...new Set(allVariables.map((v) => v.name))]
    const needsNegation = allVariables.filter((v) => v.negated).map((v) => v.name)
    const uniqueNegations = [...new Set(needsNegation)]

    if (isZero) {
      return (
        <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h4 className="text-sm font-mono font-bold text-chart-4 mb-3">{inputName} = 0</h4>
          <svg viewBox="0 0 200 60" className="w-full h-auto max-w-[200px]">
            <line
              x1="20"
              y1="30"
              x2="80"
              y2="30"
              stroke="currentColor"
              className="text-muted-foreground"
              strokeWidth="2"
            />
            <text x="90" y="35" className="fill-foreground text-sm font-mono font-bold">
              GND
            </text>
            <text x="150" y="35" className="fill-primary text-sm font-mono">
              {inputName}
            </text>
            <circle cx="140" cy="30" r="4" fill="currentColor" className="text-primary" />
          </svg>
        </div>
      )
    }

    if (isOne) {
      return (
        <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h4 className="text-sm font-mono font-bold text-chart-4 mb-3">{inputName} = 1</h4>
          <svg viewBox="0 0 200 60" className="w-full h-auto max-w-[200px]">
            <line x1="20" y1="30" x2="80" y2="30" stroke="currentColor" className="text-chart-2" strokeWidth="2" />
            <text x="90" y="35" className="fill-chart-2 text-sm font-mono font-bold">
              VCC
            </text>
            <text x="150" y="35" className="fill-primary text-sm font-mono">
              {inputName}
            </text>
            <circle cx="140" cy="30" r="4" fill="currentColor" className="text-primary" />
          </svg>
        </div>
      )
    }

    // Single term with single variable
    if (numTerms === 1 && terms[0].variables.length === 1) {
      const v = terms[0].variables[0]
      return (
        <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h4 className="text-sm font-mono font-bold text-chart-4 mb-3">
            {inputName} = {v.negated ? <span style={{ textDecoration: "overline" }}>{v.name}</span> : v.name}
          </h4>
          <svg viewBox="0 0 250 80" className="w-full h-auto max-w-[250px]">
            {/* Input */}
            <text x="10" y="45" className="fill-foreground text-xs font-mono">
              {v.name}
            </text>
            <line x1="30" y1="40" x2="70" y2="40" stroke="currentColor" className="text-chart-3" strokeWidth="2" />

            {v.negated ? (
              <>
                {/* NOT gate */}
                <polygon
                  points="80,25 80,55 110,40"
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-5"
                  strokeWidth="2"
                />
                <circle
                  cx="115"
                  cy="40"
                  r="5"
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-5"
                  strokeWidth="2"
                />
                <text x="85" y="70" className="fill-chart-5 text-[10px] font-mono">
                  NOT
                </text>
                <line
                  x1="120"
                  y1="40"
                  x2="180"
                  y2="40"
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth="2"
                />
              </>
            ) : (
              <line x1="70" y1="40" x2="180" y2="40" stroke="currentColor" className="text-primary" strokeWidth="2" />
            )}

            <text x="190" y="45" className="fill-primary text-sm font-mono font-bold">
              {inputName}
            </text>
          </svg>
        </div>
      )
    }

    // Calculate positions for terms
    const termSpacing = Math.max(50, (svgHeight - 60) / numTerms)
    const termStartY = 40

    return (
      <div key={index} className="p-4 rounded-lg bg-secondary/30 border border-border">
        <h4 className="text-sm font-mono font-bold text-chart-4 mb-3">
          {inputName} = <span dangerouslySetInnerHTML={{ __html: formatEquation(data.equations[index].expression) }} />
        </h4>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          {/* Input lines and labels */}
          {uniqueVarNames.map((varName, i) => {
            const y = 25 + i * 20
            return (
              <g key={`input-${varName}`}>
                <text x="5" y={y + 4} className="fill-foreground text-[10px] font-mono">
                  {varName}
                </text>
                <line
                  x1={inputX}
                  y1={y}
                  x2={notGateX - 10}
                  y2={y}
                  stroke="currentColor"
                  className="text-chart-3"
                  strokeWidth="1.5"
                />
                <circle cx={notGateX - 10} cy={y} r="2" fill="currentColor" className="text-chart-3" />
              </g>
            )
          })}

          {/* NOT gates for negated variables */}
          {uniqueNegations.map((varName, i) => {
            const inputY = 25 + uniqueVarNames.indexOf(varName) * 20
            const notY = 25 + i * 25
            return (
              <g key={`not-${varName}`}>
                {/* Line from input to NOT gate */}
                <line
                  x1={notGateX - 10}
                  y1={inputY}
                  x2={notGateX - 10}
                  y2={notY}
                  stroke="currentColor"
                  className="text-chart-3"
                  strokeWidth="1"
                  strokeDasharray="2"
                />
                <line
                  x1={notGateX - 10}
                  y1={notY}
                  x2={notGateX}
                  y2={notY}
                  stroke="currentColor"
                  className="text-chart-3"
                  strokeWidth="1.5"
                />

                {/* NOT gate triangle */}
                <polygon
                  points={`${notGateX},${notY - 10} ${notGateX},${notY + 10} ${notGateX + 20},${notY}`}
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-5"
                  strokeWidth="1.5"
                />
                {/* Bubble */}
                <circle
                  cx={notGateX + 24}
                  cy={notY}
                  r="4"
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-5"
                  strokeWidth="1.5"
                />

                {/* NOT label */}
                <text x={notGateX + 2} y={notY + 22} className="fill-chart-5 text-[8px] font-mono">
                  NOT
                </text>

                {/* Output line from NOT */}
                <line
                  x1={notGateX + 28}
                  y1={notY}
                  x2={notGateX + 50}
                  y2={notY}
                  stroke="currentColor"
                  className="text-chart-5"
                  strokeWidth="1.5"
                />
                <circle cx={notGateX + 50} cy={notY} r="2" fill="currentColor" className="text-chart-5" />

                {/* Negated variable label */}
                <text
                  x={notGateX + 35}
                  y={notY - 8}
                  className="fill-muted-foreground text-[8px] font-mono"
                  style={{ textDecoration: "overline" }}
                >
                  {varName}
                </text>
              </g>
            )
          })}

          {/* AND gates for each term */}
          {terms.map((term, termIdx) => {
            const termY = termStartY + termIdx * termSpacing
            const numInputs = term.variables.length

            if (numInputs === 0) return null

            // Single variable term - no AND gate needed
            if (numInputs === 1) {
              const v = term.variables[0]
              const sourceY = v.negated
                ? 25 + uniqueNegations.indexOf(v.name) * 25
                : 25 + uniqueVarNames.indexOf(v.name) * 20
              const sourceX = v.negated ? notGateX + 50 : notGateX - 10

              return (
                <g key={`term-${termIdx}`}>
                  <line
                    x1={sourceX}
                    y1={sourceY}
                    x2={andGateX + 40}
                    y2={termY}
                    stroke="currentColor"
                    className="text-chart-4"
                    strokeWidth="1.5"
                  />
                  <circle cx={andGateX + 40} cy={termY} r="3" fill="currentColor" className="text-chart-4" />
                </g>
              )
            }

            // AND gate
            const gateHeight = Math.max(30, numInputs * 12)
            const gateTop = termY - gateHeight / 2

            return (
              <g key={`and-${termIdx}`}>
                {/* AND gate shape */}
                <path
                  d={`M ${andGateX} ${gateTop} 
                      L ${andGateX} ${gateTop + gateHeight} 
                      L ${andGateX + 20} ${gateTop + gateHeight} 
                      A ${gateHeight / 2} ${gateHeight / 2} 0 0 0 ${andGateX + 20} ${gateTop}
                      Z`}
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-2"
                  strokeWidth="1.5"
                />
                <text x={andGateX + 5} y={termY + 4} className="fill-chart-2 text-[9px] font-mono">
                  AND
                </text>

                {/* Inputs to AND gate */}
                {term.variables.map((v, vIdx) => {
                  const inputSpacing = gateHeight / (numInputs + 1)
                  const inputY = gateTop + inputSpacing * (vIdx + 1)

                  const sourceY = v.negated
                    ? 25 + uniqueNegations.indexOf(v.name) * 25
                    : 25 + uniqueVarNames.indexOf(v.name) * 20
                  const sourceX = v.negated ? notGateX + 50 : notGateX - 10

                  return (
                    <g key={`and-input-${termIdx}-${vIdx}`}>
                      <line
                        x1={sourceX}
                        y1={sourceY}
                        x2={sourceX + 30}
                        y2={sourceY}
                        stroke="currentColor"
                        className={v.negated ? "text-chart-5" : "text-chart-3"}
                        strokeWidth="1"
                      />
                      <line
                        x1={sourceX + 30}
                        y1={sourceY}
                        x2={sourceX + 30}
                        y2={inputY}
                        stroke="currentColor"
                        className={v.negated ? "text-chart-5" : "text-chart-3"}
                        strokeWidth="1"
                      />
                      <line
                        x1={sourceX + 30}
                        y1={inputY}
                        x2={andGateX}
                        y2={inputY}
                        stroke="currentColor"
                        className={v.negated ? "text-chart-5" : "text-chart-3"}
                        strokeWidth="1"
                      />
                    </g>
                  )
                })}

                {/* AND gate output */}
                <line
                  x1={andGateX + 20 + gateHeight / 2}
                  y1={termY}
                  x2={andGateX + 60}
                  y2={termY}
                  stroke="currentColor"
                  className="text-chart-2"
                  strokeWidth="1.5"
                />
                <circle cx={andGateX + 60} cy={termY} r="3" fill="currentColor" className="text-chart-2" />
              </g>
            )
          })}

          {/* OR gate if multiple terms */}
          {numTerms > 1 ? (
            <g>
              {/* OR gate shape */}
              <path
                d={`M ${orGateX} ${termStartY - 15}
                    Q ${orGateX + 15} ${termStartY + ((numTerms - 1) * termSpacing) / 2} ${orGateX} ${termStartY + (numTerms - 1) * termSpacing + 15}
                    Q ${orGateX + 30} ${termStartY + (numTerms - 1) * termSpacing + 15} ${orGateX + 50} ${termStartY + ((numTerms - 1) * termSpacing) / 2}
                    Q ${orGateX + 30} ${termStartY - 15} ${orGateX} ${termStartY - 15}
                    Z`}
                fill="none"
                stroke="currentColor"
                className="text-chart-1"
                strokeWidth="1.5"
              />
              <text
                x={orGateX + 15}
                y={termStartY + ((numTerms - 1) * termSpacing) / 2 + 4}
                className="fill-chart-1 text-[9px] font-mono"
              >
                OR
              </text>

              {/* Lines from AND gates to OR gate */}
              {terms.map((term, termIdx) => {
                const termY = termStartY + termIdx * termSpacing
                const orInputY =
                  termStartY - 10 + ((termIdx + 1) * ((numTerms - 1) * termSpacing + 20)) / (numTerms + 1)

                const sourceX = term.variables.length === 1 ? andGateX + 40 : andGateX + 60

                return (
                  <g key={`or-input-${termIdx}`}>
                    <line
                      x1={sourceX}
                      y1={termY}
                      x2={orGateX - 20}
                      y2={termY}
                      stroke="currentColor"
                      className="text-chart-2"
                      strokeWidth="1"
                    />
                    <line
                      x1={orGateX - 20}
                      y1={termY}
                      x2={orGateX - 20}
                      y2={orInputY}
                      stroke="currentColor"
                      className="text-chart-2"
                      strokeWidth="1"
                    />
                    <line
                      x1={orGateX - 20}
                      y1={orInputY}
                      x2={orGateX + 8}
                      y2={orInputY}
                      stroke="currentColor"
                      className="text-chart-2"
                      strokeWidth="1"
                    />
                  </g>
                )
              })}

              {/* OR gate output */}
              <line
                x1={orGateX + 50}
                y1={termStartY + ((numTerms - 1) * termSpacing) / 2}
                x2={outputX - 20}
                y2={termStartY + ((numTerms - 1) * termSpacing) / 2}
                stroke="currentColor"
                className="text-primary"
                strokeWidth="2"
              />

              {/* Output label */}
              <text
                x={outputX - 15}
                y={termStartY + ((numTerms - 1) * termSpacing) / 2 + 5}
                className="fill-primary text-sm font-mono font-bold"
              >
                {inputName}
              </text>
            </g>
          ) : (
            // Single term - direct output
            <g>
              <line
                x1={terms[0].variables.length === 1 ? andGateX + 40 : andGateX + 60}
                y1={termStartY}
                x2={outputX - 20}
                y2={termStartY}
                stroke="currentColor"
                className="text-primary"
                strokeWidth="2"
              />
              <text x={outputX - 15} y={termStartY + 5} className="fill-primary text-sm font-mono font-bold">
                {inputName}
              </text>
            </g>
          )}
        </svg>
      </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <GitBranch className="w-5 h-5 text-primary" />
          Circuitos de Compuertas Lógicas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {parsedEquations.map((parsed, index) => renderGateCircuit(parsed, index))}
        </div>

        {/* Gate Legend */}
        <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
          <h4 className="text-xs font-medium text-foreground mb-2">Leyenda de Compuertas</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 30 20" className="w-8 h-5">
                <polygon
                  points="0,0 0,20 15,10"
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-5"
                  strokeWidth="2"
                />
                <circle
                  cx="19"
                  cy="10"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-5"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-muted-foreground">NOT</span>
            </div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 35 20" className="w-9 h-5">
                <path
                  d="M 0 0 L 0 20 L 15 20 A 10 10 0 0 0 15 0 Z"
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-2"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-muted-foreground">AND</span>
            </div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 35 20" className="w-9 h-5">
                <path
                  d="M 0 0 Q 8 10 0 20 Q 20 20 30 10 Q 20 0 0 0 Z"
                  fill="none"
                  stroke="currentColor"
                  className="text-chart-1"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-muted-foreground">OR</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatEquation(equation: string): string {
  return equation
    .replace(/([A-Z])'/g, '<span style="text-decoration: overline">$1</span>')
    .replace(/\+/g, " + ")
    .replace(/·/g, "·")
}
