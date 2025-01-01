'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Upload, Loader2 } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import { Modal } from '@/components/ui/Modal'

interface ReceiptUploadProps {
  onClose: () => void
  onDetectedAmount: (amount: number, image: string, date: string) => void
}

export function ReceiptUpload({ onClose, onDetectedAmount }: ReceiptUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [receiptImage, setReceiptImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [detectedAmount, setDetectedAmount] = useState<number | null>(null)
  const [detectedDate, setDetectedDate] = useState<string | null>(null)

  const detectDate = (text: string): string | null => {
    // Common date patterns
    const patterns = [
      // MM/DD/YYYY or MM-DD-YYYY
      /\b(0?[1-9]|1[0-2])[\/\-\.](0?[1-9]|[12]\d|3[01])[\/\-\.](20\d{2}|\d{2})\b/,
      // YYYY/MM/DD or YYYY-MM-DD
      /\b(20\d{2}|\d{2})[\/\-\.](0?[1-9]|1[0-2])[\/\-\.](0?[1-9]|[12]\d|3[01])\b/,
      // DD/MM/YYYY or DD-MM-YYYY
      /\b(0?[1-9]|[12]\d|3[01])[\/\-\.](0?[1-9]|1[0-2])[\/\-\.](20\d{2}|\d{2})\b/,
      // Text dates (13 Jan 2024, Jan 13 2024, etc)
      /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?,?\s*(?:20\d{2}|\d{2}))\b/i,
      /\b(?:(?:0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*,?\s*(?:20\d{2}|\d{2}))\b/i,
      // Dates with weekday (Mon, Monday, etc)
      /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?,?\s*(?:20\d{2}|\d{2})\b/i
    ]

    const months: { [key: string]: string } = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    }

    // Try each pattern
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (!match) continue

      const dateStr = match[0]
      try {
        if (dateStr.match(/[a-z]/i)) {
          // Handle text dates
          const parts = dateStr.match(/(\d{1,2})|([a-zA-Z]{3}[a-zA-Z]*)|(\d{2,4})/g)
          if (!parts || parts.length < 3) continue

          let day, month, year

          // Find the month part
          const monthIndex = parts.findIndex(part =>
            months[part.toLowerCase().substring(0, 3)])
          if (monthIndex === -1) continue

          month = months[parts[monthIndex].toLowerCase().substring(0, 3)]

          // Determine day and year based on month position
          if (monthIndex === 0) {
            day = parts[1].replace(/\D/g, '').padStart(2, '0')
            year = parts[2]
          } else {
            day = parts[0].replace(/\D/g, '').padStart(2, '0')
            year = parts[2]
          }

          // Handle 2-digit years
          if (year.length === 2) year = '20' + year

          return `${year}-${month}-${day}`
        } else {
          // Handle numeric dates
          const parts = dateStr.split(/[\/\-\.]/)
          if (parts.length !== 3) continue

          // Try to determine format based on year position
          let year, month, day
          if (parts[0].length === 4) {
            // YYYY-MM-DD
            [year, month, day] = parts
          } else if (parts[2].length === 4 || parts[2].length === 2) {
            // MM-DD-YYYY or DD-MM-YYYY
            // Assume MM-DD-YYYY for US receipts
            [month, day, year] = parts
          } else {
            continue
          }

          // Validate and pad values
          month = month.padStart(2, '0')
          day = day.padStart(2, '0')
          year = year.length === 2 ? '20' + year : year

          // Basic validation
          if (parseInt(month) > 12 || parseInt(day) > 31) continue

          return `${year}-${month}-${day}`
        }
      } catch (error) {
        continue
      }
    }

    return null
  }

  const processImage = async (imageData: string | Blob) => {
    setIsProcessing(true)
    try {
      if (imageData instanceof Blob) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64Image = e.target?.result as string
          setReceiptImage(base64Image)

          const worker = await createWorker('eng')
          const result = await worker.recognize(imageData)
          await worker.terminate()

          const text = result.data.text
          const detectedDate = detectDate(text) || new Date().toISOString().split('T')[0]

          // Extract amount
          const amountRegex = /\$?\d+\.\d{2}/g
          const amounts = text.match(amountRegex)

          if (amounts && amounts.length > 0) {
            const total = Math.max(...amounts.map(amount =>
              parseFloat(amount.replace('$', ''))
            ))

            setDetectedAmount(total)
            setDetectedDate(detectedDate)
          }
        }
        reader.readAsDataURL(imageData)
      }
    } catch (error) {
      console.error('Error processing receipt:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processImage(file)
    }
  }

  const handleContinue = () => {
    if (detectedAmount && receiptImage) {
      onDetectedAmount(detectedAmount, receiptImage, detectedDate || new Date().toISOString().split('T')[0])
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-200">
            Upload Receipt
          </h3>
          <button
            onClick={() => {
              onClose()
            }}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {isProcessing ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
              <p className="text-slate-200 mb-2">Processing Receipt</p>
            </div>
          ) : receiptImage ? (
            <div className="space-y-4">
              <img
                src={receiptImage}
                alt="Receipt"
                className="w-full rounded-lg border border-slate-700"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleContinue}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-300",
                    "bg-emerald-600 hover:bg-emerald-500",
                    "text-white shadow-lg"
                  )}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-12",
                  "rounded-lg border-2 border-dashed border-slate-700",
                  "hover:border-slate-600 transition-colors"
                )}
              >
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-slate-200">Upload File</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
