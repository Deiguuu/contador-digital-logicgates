"use client"

import { forwardRef } from "react"
import type { CounterData, CounterConfig } from "@/lib/counter-logic"

interface ExportReportProps {
  data: CounterData | null
  config: CounterConfig
}

export const ExportReport = forwardRef<HTMLDivElement, ExportReportProps>(({ data, config }, ref) => {
  if (!data || !data.sequence || data.sequence.length === 0) return null
  if (!data.stateTable || !data.transitionTable || !data.karnaughMaps) return null

  const flipFlopLabels = Array.from({ length: config.bits }, (_, i) => String.fromCharCode(65 + i)).reverse()

  const getInputLabels = () => {
    switch (config.flipFlopType) {
      case "JK":
        return flipFlopLabels.flatMap((l) => [`J${l}`, `K${l}`])
      case "T":
        return flipFlopLabels.map((l) => `T${l}`)
      case "D":
        return flipFlopLabels.map((l) => `D${l}`)
    }
  }

  const inputLabels = getInputLabels()

  // Render negated variable
  const renderVar = (v: string) => {
    if (v.startsWith("!")) {
      return (
        <span className="inline-flex flex-col items-center">
          <span style={{ borderBottom: "2px solid #1f2937", lineHeight: "1" }}>{v.slice(1)}</span>
        </span>
      )
    }
    return <span>{v}</span>
  }

  // Format equation for display
  const formatEquation = (eq: string) => {
    if (!eq) return <span className="font-mono">0</span>
    if (eq === "0" || eq === "1") return <span className="font-mono">{eq}</span>

    const terms = eq.split(" + ")
    return (
      <span className="font-mono text-sm">
        {terms.map((term, i) => {
          const vars = term.split("·")
          return (
            <span key={i}>
              {i > 0 && <span className="mx-1">+</span>}
              {vars.map((v, j) => (
                <span key={j}>
                  {j > 0 && <span className="mx-0.5">·</span>}
                  {renderVar(v.trim())}
                </span>
              ))}
            </span>
          )
        })}
      </span>
    )
  }

  const getKmapValue = (values: (0 | 1 | "X")[] | undefined, index: number): string => {
    if (!values || index >= values.length) return "X"
    return String(values[index])
  }

  const findGroup = (kmap: { groups?: { cells: number[] }[] } | undefined, cellIndex: number) => {
    if (!kmap || !kmap.groups) return undefined
    return kmap.groups.find((g) => g.cells && g.cells.includes(cellIndex))
  }

  const getGroupColor = (kmap: { groups?: { cells: number[] }[] } | undefined, cellIndex: number) => {
    const colors = [
      "bg-red-200 border-red-400",
      "bg-blue-200 border-blue-400",
      "bg-green-200 border-green-400",
      "bg-yellow-200 border-yellow-400",
    ]
    const group = findGroup(kmap, cellIndex)
    if (!group || !kmap?.groups) return "bg-white border-gray-300"
    return colors[kmap.groups.indexOf(group) % colors.length]
  }

  return (
    <div
      ref={ref}
      className="bg-white text-gray-900 p-8 min-w-[1200px]"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Diseño de Contador Digital</h1>
        <p className="text-gray-600">
          Contador{" "}
          {config.countMode === "ascending"
            ? "Ascendente"
            : config.countMode === "descending"
              ? "Descendente"
              : "Personalizado"}{" "}
          | {config.bits} Bits | Flip-Flop {config.flipFlopType}
        </p>
        {config.resetState !== undefined && (
          <p className="text-amber-600 mt-2">Reinicio personalizado al estado: {config.resetState}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Sequence Info */}
        <div className="col-span-2 bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Secuencia de Estados</h3>
          <p className="font-mono text-lg">
            {data.sequence.join(" → ")}
            {config.resetState !== undefined ? ` → ${config.resetState}` : ` → ${data.sequence[0]}`}
          </p>
        </div>

        {/* State Diagram Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">Diagrama de Estados</h2>
          <svg viewBox="0 0 400 400" className="w-full max-w-[400px] mx-auto">
            {data.sequence.map((state, index) => {
              const total = data.sequence.length
              const angle = (index * 2 * Math.PI) / total - Math.PI / 2
              const radius = 140
              const x = 200 + radius * Math.cos(angle)
              const y = 200 + radius * Math.sin(angle)

              const nextIndex = (index + 1) % total
              const nextAngle = (nextIndex * 2 * Math.PI) / total - Math.PI / 2
              const nextX = 200 + radius * Math.cos(nextAngle)
              const nextY = 200 + radius * Math.sin(nextAngle)

              const isResetTarget = config.resetState === state
              const isLastState = index === data.sequence.length - 1

              const midX = (x + nextX) / 2
              const midY = (y + nextY) / 2
              const dx = nextX - x
              const dy = nextY - y
              const dist = Math.sqrt(dx * dx + dy * dy)
              const normX = -dy / dist
              const normY = dx / dist
              const curveOffset = 20
              const ctrlX = midX + normX * curveOffset
              const ctrlY = midY + normY * curveOffset

              return (
                <g key={`state-${state}-${index}`}>
                  <defs>
                    <marker
                      id={`arrow-export-${index}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={isLastState && config.resetState !== undefined ? "#f59e0b" : "#6366f1"}
                      />
                    </marker>
                  </defs>
                  <path
                    d={`M ${x} ${y} Q ${ctrlX} ${ctrlY} ${nextX} ${nextY}`}
                    fill="none"
                    stroke={isLastState && config.resetState !== undefined ? "#f59e0b" : "#6366f1"}
                    strokeWidth="2"
                    strokeDasharray={isLastState && config.resetState !== undefined ? "5,5" : "none"}
                    markerEnd={`url(#arrow-export-${index})`}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="30"
                    fill={index === 0 ? "#dcfce7" : isResetTarget ? "#fef3c7" : "white"}
                    stroke={index === 0 ? "#22c55e" : isResetTarget ? "#f59e0b" : "#6366f1"}
                    strokeWidth="3"
                  />
                  <text x={x} y={y - 5} textAnchor="middle" className="font-bold text-lg" fill="#1f2937">
                    {state}
                  </text>
                  <text x={x} y={y + 12} textAnchor="middle" className="text-xs font-mono" fill="#6b7280">
                    {state.toString(2).padStart(config.bits, "0")}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* State Tables */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">Tablas de Estado</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Present State */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-center">Estado Presente (Q)</h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="border border-gray-300 px-2 py-1">Dec</th>
                    {flipFlopLabels.map((l) => (
                      <th key={l} className="border border-gray-300 px-2 py-1">
                        Q{l}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.stateTable.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-2 py-1 text-center font-mono">{row.presentState}</td>
                      {(row.presentBits || []).map((bit, j) => (
                        <td key={j} className="border border-gray-300 px-2 py-1 text-center font-mono">
                          {bit}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Next State */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-center">Estado Futuro (Q+)</h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-emerald-100">
                    <th className="border border-gray-300 px-2 py-1">Dec</th>
                    {flipFlopLabels.map((l) => (
                      <th key={l} className="border border-gray-300 px-2 py-1">
                        Q{l}+
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.stateTable.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-2 py-1 text-center font-mono">{row.nextState}</td>
                      {(row.nextBits || []).map((bit, j) => (
                        <td key={j} className="border border-gray-300 px-2 py-1 text-center font-mono">
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

        {/* Transition Table */}
        <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">Tabla de Transición</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-indigo-100">
                <th className="border border-gray-300 px-3 py-2">Estado</th>
                {flipFlopLabels.map((l) => (
                  <th key={`q${l}`} className="border border-gray-300 px-3 py-2">
                    Q{l}
                  </th>
                ))}
                <th className="border border-gray-300 px-3 py-2">Siguiente</th>
                {flipFlopLabels.map((l) => (
                  <th key={`q${l}+`} className="border border-gray-300 px-3 py-2">
                    Q{l}+
                  </th>
                ))}
                {inputLabels.map((label) => (
                  <th key={label} className="border border-gray-300 px-3 py-2 bg-purple-100">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.transitionTable.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono font-bold">
                    {row.presentState}
                  </td>
                  {(row.presentBits || []).map((bit, j) => (
                    <td key={j} className="border border-gray-300 px-3 py-2 text-center font-mono">
                      {bit}
                    </td>
                  ))}
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono font-bold">{row.nextState}</td>
                  {(row.nextBits || []).map((bit, j) => (
                    <td key={j} className="border border-gray-300 px-3 py-2 text-center font-mono">
                      {bit}
                    </td>
                  ))}
                  {(row.inputs || []).map((input, j) => (
                    <td key={j} className="border border-gray-300 px-3 py-2 text-center font-mono bg-purple-50">
                      {input}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Karnaugh Maps and Equations */}
        <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
            Mapas de Karnaugh y Ecuaciones
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(data.karnaughMaps).map(([input, kmap]) => (
              <div key={input} className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-lg text-indigo-600 mb-3 text-center">{input}</h3>

                {/* K-Map Grid */}
                <div className="mb-4">
                  {config.bits === 2 && (
                    <table className="mx-auto border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="px-2 py-1"></th>
                          <th className="px-2 py-1 text-gray-600">0</th>
                          <th className="px-2 py-1 text-gray-600">1</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[0, 1].map((row) => (
                          <tr key={row}>
                            <th className="px-2 py-1 text-gray-600">{row}</th>
                            {[0, 1].map((col) => {
                              const cellIndex = row * 2 + col
                              return (
                                <td
                                  key={col}
                                  className={`border-2 w-10 h-10 text-center font-mono ${getGroupColor(kmap, cellIndex)}`}
                                >
                                  {getKmapValue(kmap?.values, cellIndex)}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {config.bits === 3 && (
                    <table className="mx-auto border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="px-2 py-1"></th>
                          <th className="px-2 py-1 text-gray-600">00</th>
                          <th className="px-2 py-1 text-gray-600">01</th>
                          <th className="px-2 py-1 text-gray-600">11</th>
                          <th className="px-2 py-1 text-gray-600">10</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[0, 1].map((row) => (
                          <tr key={row}>
                            <th className="px-2 py-1 text-gray-600">{row}</th>
                            {[0, 1, 3, 2].map((col) => {
                              const cellIndex = row * 4 + col
                              return (
                                <td
                                  key={col}
                                  className={`border-2 w-10 h-10 text-center font-mono ${getGroupColor(kmap, cellIndex)}`}
                                >
                                  {getKmapValue(kmap?.values, cellIndex)}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {config.bits === 4 && (
                    <table className="mx-auto border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="px-1 py-1"></th>
                          <th className="px-1 py-1 text-gray-600 text-xs">00</th>
                          <th className="px-1 py-1 text-gray-600 text-xs">01</th>
                          <th className="px-1 py-1 text-gray-600 text-xs">11</th>
                          <th className="px-1 py-1 text-gray-600 text-xs">10</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[0, 1, 3, 2].map((row) => (
                          <tr key={row}>
                            <th className="px-1 py-1 text-gray-600 text-xs">{row.toString(2).padStart(2, "0")}</th>
                            {[0, 1, 3, 2].map((col) => {
                              const cellIndex = row * 4 + col
                              return (
                                <td
                                  key={col}
                                  className={`border-2 w-8 h-8 text-center font-mono text-xs ${getGroupColor(kmap, cellIndex)}`}
                                >
                                  {getKmapValue(kmap?.values, cellIndex)}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Equation */}
                <div className="text-center p-2 bg-gray-100 rounded">
                  <span className="font-bold text-indigo-600">{input} = </span>
                  {formatEquation(kmap?.equation || "0")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gate Circuits Summary */}
        <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
            Ecuaciones de Lógica Combinacional
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(data.karnaughMaps).map(([input, kmap]) => (
              <div key={input} className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="font-bold text-indigo-600 mb-1">{input}</div>
                <div className="font-mono text-sm">{formatEquation(kmap?.equation || "0")}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Schematic Summary */}
        <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">Esquema del Contador</h2>
          <div className="flex justify-center">
            <svg viewBox="0 0 800 300" className="w-full max-w-[800px]">
              {/* Clock signal */}
              <g>
                <text x="30" y="150" className="text-sm font-bold" fill="#1f2937">
                  CLK
                </text>
                <line x1="60" y1="145" x2="100" y2="145" stroke="#6366f1" strokeWidth="2" />
                <path d="M 70 145 L 70 135 L 80 135 L 80 145" fill="none" stroke="#6366f1" strokeWidth="2" />
              </g>

              {/* Flip-flops */}
              {flipFlopLabels.map((label, index) => {
                const xPos = 150 + index * 200
                return (
                  <g key={label}>
                    {/* FF Box */}
                    <rect
                      x={xPos}
                      y="80"
                      width="100"
                      height="140"
                      fill="white"
                      stroke="#6366f1"
                      strokeWidth="2"
                      rx="4"
                    />
                    <text x={xPos + 50} y="105" textAnchor="middle" className="font-bold" fill="#6366f1">
                      FF {label}
                    </text>
                    <text x={xPos + 15} y="130" className="text-xs" fill="#6b7280">
                      {config.flipFlopType === "JK" ? "J" : config.flipFlopType === "T" ? "T" : "D"}
                    </text>
                    {config.flipFlopType === "JK" && (
                      <text x={xPos + 15} y="170" className="text-xs" fill="#6b7280">
                        K
                      </text>
                    )}
                    <text x={xPos + 15} y="200" className="text-xs" fill="#6b7280">
                      CLK
                    </text>
                    <text x={xPos + 80} y="140" className="text-xs" fill="#6b7280">
                      Q
                    </text>
                    <text x={xPos + 80} y="175" className="text-xs" fill="#6b7280">
                      Q'
                    </text>

                    {/* Clock connection */}
                    <line x1="100" y1="145" x2={xPos} y2="195" stroke="#6366f1" strokeWidth="1.5" />

                    {/* Output Q */}
                    <line x1={xPos + 100} y1="135" x2={xPos + 130} y2="135" stroke="#22c55e" strokeWidth="2" />
                    <text x={xPos + 135} y="140" className="text-xs font-bold" fill="#22c55e">
                      Q{label}
                    </text>
                  </g>
                )
              })}

              {/* Combinational Logic Block */}
              <rect x="100" y="250" width="600" height="40" fill="#f3e8ff" stroke="#a855f7" strokeWidth="2" rx="4" />
              <text x="400" y="275" textAnchor="middle" className="font-bold" fill="#7c3aed">
                Lógica Combinacional
              </text>

              {/* Feedback arrows */}
              {flipFlopLabels.map((label, index) => {
                const xPos = 150 + index * 200
                return (
                  <g key={`fb-${label}`}>
                    <path
                      d={`M ${xPos + 115} 135 L ${xPos + 115} 250`}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="1.5"
                      strokeDasharray="4,2"
                    />
                    <path
                      d={`M ${xPos + 30} 250 L ${xPos + 30} 220 L ${xPos} 220 L ${xPos} 125`}
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="1.5"
                    />
                    <polygon points={`${xPos},125 ${xPos - 5},132 ${xPos + 5},132`} fill="#a855f7" />
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Footer */}
        <div className="col-span-2 text-center text-gray-500 text-sm mt-4 pt-4 border-t border-gray-300">
          Generado por Diseñador de Contadores Digitales
        </div>
      </div>
    </div>
  )
})

ExportReport.displayName = "ExportReport"
