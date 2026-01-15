"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Settings, Play, AlertCircle, RotateCcw, Info } from "lucide-react"
import type { CounterConfig } from "@/lib/counter-logic"

interface ConfigPanelProps {
  onGenerate: (config: CounterConfig) => void
  currentConfig: CounterConfig
}

export function ConfigPanel({ onGenerate, currentConfig }: ConfigPanelProps) {
  const [bits, setBits] = useState<number>(currentConfig.bits)
  const [flipFlopType, setFlipFlopType] = useState<"JK" | "T" | "D">(currentConfig.flipFlopType)
  const [countMode, setCountMode] = useState<"ascending" | "descending" | "custom">(currentConfig.countMode)
  const [customSequence, setCustomSequence] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [useCustomReset, setUseCustomReset] = useState<boolean>(false)
  const [resetState, setResetState] = useState<string>("")
  const [detectedReset, setDetectedReset] = useState<{ detected: boolean; state: number | null }>({
    detected: false,
    state: null,
  })

  const maxValue = Math.pow(2, bits) - 1

  useEffect(() => {
    if (countMode === "ascending") {
      setCustomSequence(Array.from({ length: Math.pow(2, bits) }, (_, i) => i).join(", "))
      setUseCustomReset(false)
      setResetState("")
    } else if (countMode === "descending") {
      setCustomSequence(Array.from({ length: Math.pow(2, bits) }, (_, i) => maxValue - i).join(", "))
      setUseCustomReset(false)
      setResetState("")
    }
  }, [countMode, bits, maxValue])

  useEffect(() => {
    if (countMode === "custom" && customSequence) {
      const parsed = customSequence.split(",").map((s) => Number.parseInt(s.trim(), 10))
      const validParsed = parsed.filter((n) => !isNaN(n))

      // Check if any number is repeated - the repeated number indicates reset point
      const seen = new Set<number>()
      let repeatedState: number | null = null

      for (const num of validParsed) {
        if (seen.has(num)) {
          repeatedState = num
          break
        }
        seen.add(num)
      }

      if (repeatedState !== null) {
        setDetectedReset({ detected: true, state: repeatedState })
      } else {
        setDetectedReset({ detected: false, state: null })
      }
    } else {
      setDetectedReset({ detected: false, state: null })
    }
  }, [customSequence, countMode])

  const applyDetectedReset = () => {
    if (detectedReset.detected && detectedReset.state !== null) {
      setUseCustomReset(true)
      setResetState(detectedReset.state.toString())

      // Remove the repeated number from the end of sequence
      const parsed = customSequence.split(",").map((s) => Number.parseInt(s.trim(), 10))
      const validParsed = parsed.filter((n) => !isNaN(n))

      // Find index of first occurrence and remove duplicates
      const firstOccurrence = validParsed.indexOf(detectedReset.state)
      const uniqueSequence = validParsed.slice(0, validParsed.lastIndexOf(detectedReset.state))

      if (uniqueSequence.length > 0) {
        setCustomSequence(uniqueSequence.join(", "))
      }
    }
  }

  const validateAndGenerate = () => {
    setError("")

    let sequence: number[] = []

    if (countMode === "custom") {
      const parsed = customSequence.split(",").map((s) => Number.parseInt(s.trim(), 10))

      if (parsed.some(isNaN)) {
        setError("La secuencia contiene valores inválidos")
        return
      }

      if (parsed.some((n) => n < 0 || n > maxValue)) {
        setError(`Todos los valores deben estar entre 0 y ${maxValue}`)
        return
      }

      if (parsed.length < 2) {
        setError("La secuencia debe tener al menos 2 estados")
        return
      }

      sequence = parsed
    } else if (countMode === "ascending") {
      sequence = Array.from({ length: Math.pow(2, bits) }, (_, i) => i)
    } else {
      sequence = Array.from({ length: Math.pow(2, bits) }, (_, i) => maxValue - i)
    }

    let finalResetState: number | undefined = undefined
    if (useCustomReset && resetState !== "") {
      const parsedReset = Number.parseInt(resetState, 10)
      if (isNaN(parsedReset)) {
        setError("El estado de reinicio es inválido")
        return
      }
      if (parsedReset < 0 || parsedReset > maxValue) {
        setError(`El estado de reinicio debe estar entre 0 y ${maxValue}`)
        return
      }
      finalResetState = parsedReset
    }

    onGenerate({
      bits,
      flipFlopType,
      countMode,
      customSequence: sequence,
      resetState: finalResetState,
    })
  }

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Settings className="w-5 h-5 text-primary" />
          Configuración
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bits Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Cantidad de Bits</Label>
          <RadioGroup
            value={bits.toString()}
            onValueChange={(v) => setBits(Number.parseInt(v))}
            className="grid grid-cols-3 gap-2"
          >
            {[2, 3, 4].map((b) => (
              <div key={b}>
                <RadioGroupItem value={b.toString()} id={`bits-${b}`} className="peer sr-only" />
                <Label
                  htmlFor={`bits-${b}`}
                  className="flex items-center justify-center rounded-lg border-2 border-border bg-secondary p-3 hover:bg-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all text-secondary-foreground"
                >
                  {b} bits
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Flip-Flop Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Tipo de Flip-Flop</Label>
          <RadioGroup
            value={flipFlopType}
            onValueChange={(v) => setFlipFlopType(v as "JK" | "T" | "D")}
            className="grid grid-cols-3 gap-2"
          >
            {(["JK", "T", "D"] as const).map((type) => (
              <div key={type}>
                <RadioGroupItem value={type} id={`ff-${type}`} className="peer sr-only" />
                <Label
                  htmlFor={`ff-${type}`}
                  className="flex items-center justify-center rounded-lg border-2 border-border bg-secondary p-3 hover:bg-muted cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all font-mono text-secondary-foreground"
                >
                  {type}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Count Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Modo de Conteo</Label>
          <RadioGroup
            value={countMode}
            onValueChange={(v) => setCountMode(v as "ascending" | "descending" | "custom")}
            className="space-y-2"
          >
            {[
              { value: "ascending", label: "Ascendente" },
              { value: "descending", label: "Descendente" },
              { value: "custom", label: "Personalizado" },
            ].map(({ value, label }) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={`mode-${value}`} />
                <Label htmlFor={`mode-${value}`} className="cursor-pointer text-foreground">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Custom Sequence Input */}
        {countMode === "custom" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Secuencia Personalizada</Label>
            <Input
              placeholder={`Ej: 0, 1, 3, 7, 6, 4`}
              value={customSequence}
              onChange={(e) => setCustomSequence(e.target.value)}
              className="font-mono bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Valores separados por coma (0 a {maxValue})</p>

            {detectedReset.detected && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-xs text-amber-500">
                      Se detectó el número <strong className="font-mono">{detectedReset.state}</strong> repetido. ¿Desea
                      usarlo como punto de reinicio del ciclo?
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyDetectedReset}
                      className="h-7 text-xs border-amber-500/50 text-amber-500 hover:bg-amber-500/10 bg-transparent"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Aplicar reinicio a {detectedReset.state}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {countMode === "custom" && (
          <div className="space-y-3 p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-reset" className="text-sm font-medium text-foreground flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                Reinicio Personalizado
              </Label>
              <Switch id="custom-reset" checked={useCustomReset} onCheckedChange={setUseCustomReset} />
            </div>

            {useCustomReset && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs text-muted-foreground">Estado de reinicio del ciclo</Label>
                <Input
                  type="number"
                  min={0}
                  max={maxValue}
                  placeholder={`Ej: 4`}
                  value={resetState}
                  onChange={(e) => setResetState(e.target.value)}
                  className="font-mono bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  El contador reiniciará a este estado después del último valor de la secuencia
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Generate Button */}
        <Button onClick={validateAndGenerate} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Play className="w-4 h-4 mr-2" />
          Generar Contador
        </Button>

        {/* Info Box */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Estados máximos:</strong> {Math.pow(2, bits)}
            <br />
            <strong className="text-foreground">Rango:</strong> 0 - {maxValue}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
