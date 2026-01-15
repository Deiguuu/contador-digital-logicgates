"use client"

import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2, Check } from "lucide-react"
import { ExportReport } from "./export-report"
import type { CounterData, CounterConfig } from "@/lib/counter-logic"

interface DownloadButtonProps {
  data: CounterData | null
  config: CounterConfig
}

export function DownloadButton({ data, config }: DownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDownload = useCallback(async () => {
    if (!data || !reportRef.current) return

    setIsExporting(true)

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default

      // Render the report
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        windowWidth: 1400,
        windowHeight: reportRef.current.scrollHeight,
      })

      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `contador-${config.bits}bits-${config.flipFlopType}-${config.countMode}-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 2000)
          }
        },
        "image/png",
        1.0,
      )
    } catch (error) {
      console.error("Error exporting:", error)
    } finally {
      setIsExporting(false)
    }
  }, [data, config])

  if (!data) return null

  return (
    <>
      <Button
        onClick={handleDownload}
        disabled={isExporting}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Exportando...
          </>
        ) : showSuccess ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Descargado
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Descargar PNG
          </>
        )}
      </Button>

      {/* Hidden container for export report */}
      <div ref={containerRef} className="fixed left-[-9999px] top-0 overflow-hidden" style={{ width: "1400px" }}>
        <ExportReport ref={reportRef} data={data} config={config} />
      </div>
    </>
  )
}
