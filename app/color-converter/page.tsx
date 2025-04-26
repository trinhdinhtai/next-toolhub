"use client"

import { useState } from "react"
import { ClipboardCopy, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ColorFormat = "hex" | "rgb" | "hsl" | "cmyk" | "hsv"

interface ColorValues {
  hex: string
  rgb: [number, number, number]
  hsl: [number, number, number]
  cmyk: [number, number, number, number]
  hsv: [number, number, number]
}

export default function ColorConverter() {
  const [inputFormat, setInputFormat] = useState<ColorFormat>("hex")
  const [inputValue, setInputValue] = useState<string>("#3b82f6")
  const [colorValues, setColorValues] = useState<ColorValues>({
    hex: "#3b82f6",
    rgb: [59, 130, 246],
    hsl: [217, 91, 60],
    cmyk: [76, 47, 0, 4],
    hsv: [217, 76, 96],
  })
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<ColorFormat | null>(null)

  const formatOptions: { value: ColorFormat; label: string }[] = [
    { value: "hex", label: "HEX" },
    { value: "rgb", label: "RGB" },
    { value: "hsl", label: "HSL" },
    { value: "cmyk", label: "CMYK" },
    { value: "hsv", label: "HSV" },
  ]

  const validateAndParseInput = (value: string, format: ColorFormat): any => {
    setError(null)

    try {
      switch (format) {
        case "hex": {
          // Validate hex format
          const hexRegex = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i
          if (!hexRegex.test(value)) {
            throw new Error("Mã màu HEX không hợp lệ. Ví dụ: #FF0000 hoặc #F00")
          }

          // Normalize hex value
          let hex = value.startsWith("#") ? value : `#${value}`
          if (hex.length === 4) {
            // Convert 3-char hex to 6-char
            hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
          }

          return hex
        }

        case "rgb": {
          // Validate and parse RGB format like "rgb(255, 0, 0)" or "255, 0, 0"
          let rgb: number[]

          if (value.toLowerCase().startsWith("rgb")) {
            const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i
            const match = value.match(rgbRegex)
            if (!match) {
              throw new Error(
                "Định dạng RGB không hợp lệ. Ví dụ: rgb(255, 0, 0)"
              )
            }
            rgb = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
          } else {
            // Try to parse as comma-separated values
            rgb = value.split(",").map((v) => {
              const parsed = parseInt(v.trim())
              if (isNaN(parsed)) {
                throw new Error("Giá trị RGB không hợp lệ. Ví dụ: 255, 0, 0")
              }
              return parsed
            })

            if (rgb.length !== 3) {
              throw new Error("RGB cần 3 giá trị. Ví dụ: 255, 0, 0")
            }
          }

          // Validate RGB values
          if (rgb.some((v) => v < 0 || v > 255)) {
            throw new Error("Giá trị RGB phải từ 0 đến 255")
          }

          return rgb as [number, number, number]
        }

        case "hsl": {
          // Validate and parse HSL format like "hsl(360, 100%, 50%)" or "360, 100%, 50%"
          let hsl: number[]

          if (value.toLowerCase().startsWith("hsl")) {
            const hslRegex = /hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i
            const match = value.match(hslRegex)
            if (!match) {
              throw new Error(
                "Định dạng HSL không hợp lệ. Ví dụ: hsl(360, 100%, 50%)"
              )
            }
            hsl = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
          } else {
            // Try to parse as comma-separated values
            hsl = value
              .split(",")
              .map((v) => parseInt(v.trim().replace("%", "")))

            if (hsl.length !== 3 || hsl.some(isNaN)) {
              throw new Error("Giá trị HSL không hợp lệ. Ví dụ: 360, 100%, 50%")
            }
          }

          // Validate HSL values
          if (hsl[0] < 0 || hsl[0] > 360) {
            throw new Error("Giá trị H (hue) phải từ 0 đến 360")
          }
          if (hsl[1] < 0 || hsl[1] > 100 || hsl[2] < 0 || hsl[2] > 100) {
            throw new Error("Giá trị S và L phải từ 0% đến 100%")
          }

          return hsl as [number, number, number]
        }

        case "cmyk": {
          // Validate and parse CMYK format like "cmyk(100%, 0%, 0%, 0%)" or "100, 0, 0, 0"
          let cmyk: number[]

          if (value.toLowerCase().startsWith("cmyk")) {
            const cmykRegex =
              /cmyk\(\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i
            const match = value.match(cmykRegex)
            if (!match) {
              throw new Error(
                "Định dạng CMYK không hợp lệ. Ví dụ: cmyk(100%, 0%, 0%, 0%)"
              )
            }
            cmyk = [
              parseInt(match[1]),
              parseInt(match[2]),
              parseInt(match[3]),
              parseInt(match[4]),
            ]
          } else {
            // Try to parse as comma-separated values
            cmyk = value
              .split(",")
              .map((v) => parseInt(v.trim().replace("%", "")))

            if (cmyk.length !== 4 || cmyk.some(isNaN)) {
              throw new Error("Giá trị CMYK không hợp lệ. Ví dụ: 100, 0, 0, 0")
            }
          }

          // Validate CMYK values
          if (cmyk.some((v) => v < 0 || v > 100)) {
            throw new Error("Giá trị CMYK phải từ 0% đến 100%")
          }

          return cmyk as [number, number, number, number]
        }

        case "hsv": {
          // Validate and parse HSV format like "hsv(360, 100%, 100%)" or "360, 100%, 100%"
          let hsv: number[]

          if (value.toLowerCase().startsWith("hsv")) {
            const hsvRegex = /hsv\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i
            const match = value.match(hsvRegex)
            if (!match) {
              throw new Error(
                "Định dạng HSV không hợp lệ. Ví dụ: hsv(360, 100%, 100%)"
              )
            }
            hsv = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
          } else {
            // Try to parse as comma-separated values
            hsv = value
              .split(",")
              .map((v) => parseInt(v.trim().replace("%", "")))

            if (hsv.length !== 3 || hsv.some(isNaN)) {
              throw new Error(
                "Giá trị HSV không hợp lệ. Ví dụ: 360, 100%, 100%"
              )
            }
          }

          // Validate HSV values
          if (hsv[0] < 0 || hsv[0] > 360) {
            throw new Error("Giá trị H (hue) phải từ 0 đến 360")
          }
          if (hsv[1] < 0 || hsv[1] > 100 || hsv[2] < 0 || hsv[2] > 100) {
            throw new Error("Giá trị S và V phải từ 0% đến 100%")
          }

          return hsv as [number, number, number]
        }

        default:
          throw new Error("Định dạng màu không được hỗ trợ")
      }
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }

  // Conversion functions between color formats
  const convertColor = () => {
    const parsedInput = validateAndParseInput(inputValue, inputFormat)
    if (!parsedInput) return

    let hex: string = ""
    let rgb: [number, number, number] = [0, 0, 0]
    let hsl: [number, number, number] | undefined = undefined
    let cmyk: [number, number, number, number] | undefined = undefined
    let hsv: [number, number, number] | undefined = undefined

    // Convert input to RGB first as an intermediate format
    switch (inputFormat) {
      case "hex": {
        hex = parsedInput
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        rgb = [r, g, b]
        break
      }

      case "rgb": {
        rgb = parsedInput
        // Convert RGB to HEX
        hex = `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1]
          .toString(16)
          .padStart(2, "0")}${rgb[2].toString(16).padStart(2, "0")}`
        break
      }

      case "hsl": {
        const [h, s, l] = parsedInput
        // Convert HSL to RGB
        const c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
        const m = l / 100 - c / 2
        let r = 0,
          g = 0,
          b = 0

        if (h >= 0 && h < 60) {
          ;[r, g, b] = [c, x, 0]
        } else if (h >= 60 && h < 120) {
          ;[r, g, b] = [x, c, 0]
        } else if (h >= 120 && h < 180) {
          ;[r, g, b] = [0, c, x]
        } else if (h >= 180 && h < 240) {
          ;[r, g, b] = [0, x, c]
        } else if (h >= 240 && h < 300) {
          ;[r, g, b] = [x, 0, c]
        } else {
          ;[r, g, b] = [c, 0, x]
        }

        rgb = [
          Math.round((r + m) * 255),
          Math.round((g + m) * 255),
          Math.round((b + m) * 255),
        ]

        // Convert RGB to HEX
        hex = `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1]
          .toString(16)
          .padStart(2, "0")}${rgb[2].toString(16).padStart(2, "0")}`

        hsl = parsedInput
        break
      }

      case "cmyk": {
        const [c, m, y, k] = parsedInput.map((v: number) => v / 100)
        // Convert CMYK to RGB
        rgb = [
          Math.round(255 * (1 - c) * (1 - k)),
          Math.round(255 * (1 - m) * (1 - k)),
          Math.round(255 * (1 - y) * (1 - k)),
        ]

        // Convert RGB to HEX
        hex = `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1]
          .toString(16)
          .padStart(2, "0")}${rgb[2].toString(16).padStart(2, "0")}`
        break
      }

      case "hsv": {
        const [h, s, v] = parsedInput
        // Convert HSV to RGB
        const s1 = s / 100
        const v1 = v / 100
        const c = v1 * s1
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
        const m = v1 - c
        let r = 0,
          g = 0,
          b = 0

        if (h >= 0 && h < 60) {
          ;[r, g, b] = [c, x, 0]
        } else if (h >= 60 && h < 120) {
          ;[r, g, b] = [x, c, 0]
        } else if (h >= 120 && h < 180) {
          ;[r, g, b] = [0, c, x]
        } else if (h >= 180 && h < 240) {
          ;[r, g, b] = [0, x, c]
        } else if (h >= 240 && h < 300) {
          ;[r, g, b] = [x, 0, c]
        } else {
          ;[r, g, b] = [c, 0, x]
        }

        rgb = [
          Math.round((r + m) * 255),
          Math.round((g + m) * 255),
          Math.round((b + m) * 255),
        ]

        // Convert RGB to HEX
        hex = `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1]
          .toString(16)
          .padStart(2, "0")}${rgb[2].toString(16).padStart(2, "0")}`

        hsv = parsedInput
        break
      }
    }

    // Now convert RGB to other formats if they weren't already calculated

    // RGB to HSL if needed
    if (!hsl) {
      const r = rgb[0] / 255
      const g = rgb[1] / 255
      const b = rgb[2] / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const d = max - min

      let h = 0
      const l = (max + min) / 2
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))

      if (d !== 0) {
        switch (max) {
          case r:
            h = 60 * (((g - b) / d) % 6)
            break
          case g:
            h = 60 * ((b - r) / d + 2)
            break
          case b:
            h = 60 * ((r - g) / d + 4)
            break
        }
      }

      if (h < 0) h += 360

      hsl = [Math.round(h), Math.round(s * 100), Math.round(l * 100)]
    }

    // RGB to CMYK
    if (!cmyk) {
      const r = rgb[0] / 255
      const g = rgb[1] / 255
      const b = rgb[2] / 255

      const k = 1 - Math.max(r, g, b)
      const c = k === 1 ? 0 : (1 - r - k) / (1 - k)
      const m = k === 1 ? 0 : (1 - g - k) / (1 - k)
      const y = k === 1 ? 0 : (1 - b - k) / (1 - k)

      cmyk = [
        Math.round(c * 100),
        Math.round(m * 100),
        Math.round(y * 100),
        Math.round(k * 100),
      ]
    }

    // RGB to HSV if needed
    if (!hsv) {
      const r = rgb[0] / 255
      const g = rgb[1] / 255
      const b = rgb[2] / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const d = max - min

      let h = 0
      const v = max
      const s = max === 0 ? 0 : d / max

      if (d !== 0) {
        switch (max) {
          case r:
            h = 60 * (((g - b) / d) % 6)
            break
          case g:
            h = 60 * ((b - r) / d + 2)
            break
          case b:
            h = 60 * ((r - g) / d + 4)
            break
        }
      }

      if (h < 0) h += 360

      hsv = [Math.round(h), Math.round(s * 100), Math.round(v * 100)]
    }

    setColorValues({
      hex: hex.toUpperCase(),
      rgb,
      hsl,
      cmyk,
      hsv,
    })
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  const copyToClipboard = (format: ColorFormat) => {
    let textToCopy = ""

    switch (format) {
      case "hex":
        textToCopy = colorValues.hex
        break
      case "rgb":
        textToCopy = `rgb(${colorValues.rgb.join(", ")})`
        break
      case "hsl":
        textToCopy = `hsl(${colorValues.hsl[0]}, ${colorValues.hsl[1]}%, ${colorValues.hsl[2]}%)`
        break
      case "cmyk":
        textToCopy = `cmyk(${colorValues.cmyk.join("%, ")}%)`
        break
      case "hsv":
        textToCopy = `hsv(${colorValues.hsv[0]}, ${colorValues.hsv[1]}%, ${colorValues.hsv[2]}%)`
        break
    }

    navigator.clipboard.writeText(textToCopy)
    setCopied(format)
    setTimeout(() => setCopied(null), 2000)
  }

  const getInputPlaceholder = () => {
    switch (inputFormat) {
      case "hex":
        return "#3b82f6"
      case "rgb":
        return "59, 130, 246 hoặc rgb(59, 130, 246)"
      case "hsl":
        return "217, 91%, 60% hoặc hsl(217, 91%, 60%)"
      case "cmyk":
        return "76, 47, 0, 4 hoặc cmyk(76%, 47%, 0%, 4%)"
      case "hsv":
        return "217, 76%, 96% hoặc hsv(217, 76%, 96%)"
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Chuyển đổi màu sắc</h1>
          <p className="text-muted-foreground">
            Chuyển đổi giữa các định dạng màu khác nhau: HEX, RGB, HSL, CMYK và
            HSV
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nhập mã màu</CardTitle>
            <CardDescription>
              Chọn định dạng và nhập giá trị màu của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Select
                value={inputFormat}
                onValueChange={(value) => setInputFormat(value as ColorFormat)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Định dạng" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={getInputPlaceholder()}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="flex-1"
              />
              <Button onClick={convertColor} size="icon" variant="secondary">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <div className="text-destructive pt-1 text-sm">{error}</div>
            )}

            {/* Color preview */}
            <div className="pt-4">
              <div
                className="h-24 w-full rounded-md border"
                style={{ backgroundColor: colorValues.hex }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {formatOptions.map((format) => (
            <Card key={format.value}>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">
                  {format.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono">
                    {format.value === "hex" && colorValues.hex}
                    {format.value === "rgb" &&
                      `rgb(${colorValues.rgb.join(", ")})`}
                    {format.value === "hsl" &&
                      `hsl(${colorValues.hsl[0]}, ${colorValues.hsl[1]}%, ${colorValues.hsl[2]}%)`}
                    {format.value === "cmyk" &&
                      `cmyk(${colorValues.cmyk.join("%, ")}%)`}
                    {format.value === "hsv" &&
                      `hsv(${colorValues.hsv[0]}, ${colorValues.hsv[1]}%, ${colorValues.hsv[2]}%)`}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(format.value)}
                    size="sm"
                    variant="ghost"
                  >
                    {copied === format.value ? (
                      "Đã sao chép!"
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
