"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Calculator, Calendar, Clock } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define time zones with offsets
const timeZones = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Ho_Chi_Minh", label: "Việt Nam (UTC+7)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Europe/London", label: "London (UTC+0/+1)" },
  { value: "Europe/Paris", label: "Paris (UTC+1/+2)" },
  { value: "America/New_York", label: "New York (UTC-5/-4)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8/-7)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10/+11)" },
]

// Date formats
const dateFormats = [
  { value: "iso", label: "ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)" },
  { value: "short", label: "DD/MM/YYYY" },
  { value: "long", label: "DD MMMM YYYY, HH:mm:ss" },
  { value: "relative", label: "Thời gian tương đối" },
  { value: "unix", label: "Unix Timestamp (giây)" },
  { value: "custom", label: "Tùy chỉnh" },
]

export default function DateTimeConverter() {
  // Current date/time
  const [currentDate, setCurrentDate] = useState(new Date())

  // Format conversion state
  const [inputDate, setInputDate] = useState("")
  const [inputFormat, setInputFormat] = useState("iso")
  const [outputFormat, setOutputFormat] = useState("long")
  const [customOutputFormat, setCustomOutputFormat] = useState(
    "DD/MM/YYYY HH:mm:ss"
  )
  const [convertedDate, setConvertedDate] = useState("")
  const [error, setError] = useState("")

  // Timezone conversion state
  const [sourceTimezone, setSourceTimezone] = useState("UTC")
  const [targetTimezone, setTargetTimezone] = useState("Asia/Ho_Chi_Minh")
  const [timezoneDate, setTimezoneDate] = useState("")
  const [convertedTimezoneDate, setConvertedTimezoneDate] = useState("")

  // Time calculation state
  const [baseDate, setBaseDate] = useState("")
  const [calcOperation, setCalcOperation] = useState("add")
  const [calcValue, setCalcValue] = useState(1)
  const [calcUnit, setCalcUnit] = useState("days")
  const [calculatedDate, setCalculatedDate] = useState("")

  // Date difference state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [dateDifference, setDateDifference] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format a date based on the selected format
  const formatDate = (date: Date, format: string, customFormat?: string) => {
    try {
      switch (format) {
        case "iso":
          return date.toISOString()
        case "short":
          return `${String(date.getDate()).padStart(2, "0")}/${String(
            date.getMonth() + 1
          ).padStart(2, "0")}/${date.getFullYear()}`
        case "long":
          return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        case "relative": {
          const now = new Date()
          const diffMs = now.getTime() - date.getTime()
          const diffSec = Math.round(diffMs / 1000)
          const diffMin = Math.round(diffSec / 60)
          const diffHour = Math.round(diffMin / 60)
          const diffDay = Math.round(diffHour / 24)

          if (diffSec < 60) return `${diffSec} giây trước`
          if (diffMin < 60) return `${diffMin} phút trước`
          if (diffHour < 24) return `${diffHour} giờ trước`
          if (diffDay < 30) return `${diffDay} ngày trước`

          return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
        }
        case "unix":
          return Math.floor(date.getTime() / 1000).toString()
        case "custom":
          if (!customFormat) return date.toISOString()

          // Very basic custom format implementation
          let formatted = customFormat
          formatted = formatted.replace("YYYY", date.getFullYear().toString())
          formatted = formatted.replace(
            "MM",
            String(date.getMonth() + 1).padStart(2, "0")
          )
          formatted = formatted.replace(
            "DD",
            String(date.getDate()).padStart(2, "0")
          )
          formatted = formatted.replace(
            "HH",
            String(date.getHours()).padStart(2, "0")
          )
          formatted = formatted.replace(
            "mm",
            String(date.getMinutes()).padStart(2, "0")
          )
          formatted = formatted.replace(
            "ss",
            String(date.getSeconds()).padStart(2, "0")
          )

          return formatted
        default:
          return date.toISOString()
      }
    } catch (err) {
      console.error("Error formatting date:", err)
      return "Invalid date"
    }
  }

  // Parse a date from string based on format
  const parseDate = (dateStr: string, format: string) => {
    try {
      setError("")

      if (!dateStr.trim()) {
        throw new Error("Vui lòng nhập ngày")
      }

      let date: Date

      switch (format) {
        case "iso":
          date = new Date(dateStr)
          break
        case "short": {
          const parts = dateStr.split("/")
          if (parts.length !== 3) {
            throw new Error("Định dạng không hợp lệ. Sử dụng DD/MM/YYYY")
          }

          const day = parseInt(parts[0], 10)
          const month = parseInt(parts[1], 10) - 1
          const year = parseInt(parts[2], 10)

          date = new Date(year, month, day)
          break
        }
        case "unix": {
          const timestamp = parseInt(dateStr, 10)
          date = new Date(timestamp * 1000)
          break
        }
        default:
          date = new Date(dateStr)
      }

      if (isNaN(date.getTime())) {
        throw new Error("Ngày không hợp lệ")
      }

      return date
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }

  // Convert date from one format to another
  const convertFormat = () => {
    const date = parseDate(inputDate, inputFormat)
    if (!date) return

    const formatted = formatDate(
      date,
      outputFormat,
      outputFormat === "custom" ? customOutputFormat : undefined
    )

    setConvertedDate(formatted)
  }

  // Convert timezone
  const convertTimezone = () => {
    try {
      setError("")

      if (!timezoneDate.trim()) {
        setError("Vui lòng nhập ngày giờ")
        return
      }

      const date = new Date(timezoneDate)
      if (isNaN(date.getTime())) {
        setError("Ngày giờ không hợp lệ")
        return
      }

      // This is a simplified implementation. In a production app, you would
      // use a library like date-fns-tz or Intl.DateTimeFormat with timeZone option
      const formatted = date.toLocaleString("vi-VN", {
        timeZone: targetTimezone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })

      setConvertedTimezoneDate(formatted)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Calculate date
  const calculateDate = () => {
    try {
      setError("")

      if (!baseDate.trim()) {
        setError("Vui lòng nhập ngày cơ sở")
        return
      }

      const date = new Date(baseDate)
      if (isNaN(date.getTime())) {
        setError("Ngày không hợp lệ")
        return
      }

      // Clone the date to avoid modifying the original
      const result = new Date(date.getTime())

      switch (calcUnit) {
        case "years":
          result.setFullYear(
            result.getFullYear() +
              (calcOperation === "add" ? calcValue : -calcValue)
          )
          break
        case "months":
          result.setMonth(
            result.getMonth() +
              (calcOperation === "add" ? calcValue : -calcValue)
          )
          break
        case "days":
          result.setDate(
            result.getDate() +
              (calcOperation === "add" ? calcValue : -calcValue)
          )
          break
        case "hours":
          result.setHours(
            result.getHours() +
              (calcOperation === "add" ? calcValue : -calcValue)
          )
          break
        case "minutes":
          result.setMinutes(
            result.getMinutes() +
              (calcOperation === "add" ? calcValue : -calcValue)
          )
          break
        case "seconds":
          result.setSeconds(
            result.getSeconds() +
              (calcOperation === "add" ? calcValue : -calcValue)
          )
          break
      }

      setCalculatedDate(result.toLocaleString("vi-VN"))
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Calculate difference between dates
  const calculateDifference = () => {
    try {
      setError("")

      if (!startDate.trim() || !endDate.trim()) {
        setError("Vui lòng nhập cả ngày bắt đầu và kết thúc")
        return
      }

      const start = new Date(startDate)
      const end = new Date(endDate)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setError("Một trong các ngày không hợp lệ")
        return
      }

      // Calculate difference in milliseconds
      const diffMs = end.getTime() - start.getTime()

      // Convert to days, hours, minutes, seconds
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000)

      setDateDifference({
        days: diffDays,
        hours: diffHours,
        minutes: diffMinutes,
        seconds: diffSeconds,
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Get placeholder examples for input based on selected format
  const getInputPlaceholder = () => {
    switch (inputFormat) {
      case "iso":
        return "2023-04-15T12:30:45.000Z"
      case "short":
        return "15/04/2023"
      case "unix":
        return "1681561845"
      default:
        return "Nhập ngày giờ..."
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Chuyển đổi ngày giờ</h1>
          <p className="text-muted-foreground">
            Công cụ chuyển đổi định dạng ngày giờ, múi giờ và thực hiện các phép
            tính với thời gian
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Thời gian hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-md border p-4">
                <div className="mb-1 text-sm font-medium">Địa phương</div>
                <div className="text-xl font-bold">
                  {currentDate.toLocaleTimeString("vi-VN")}
                </div>
                <div className="text-muted-foreground mt-1 text-sm">
                  {currentDate.toLocaleDateString("vi-VN")}
                </div>
              </div>
              <div className="rounded-md border p-4">
                <div className="mb-1 text-sm font-medium">UTC</div>
                <div className="text-xl font-bold">
                  {currentDate.toLocaleTimeString("en-GB", { timeZone: "UTC" })}
                </div>
                <div className="text-muted-foreground mt-1 text-sm">
                  {currentDate.toLocaleDateString("en-GB", { timeZone: "UTC" })}
                </div>
              </div>
              <div className="rounded-md border p-4">
                <div className="mb-1 text-sm font-medium">Unix Timestamp</div>
                <div className="text-xl font-bold">
                  {Math.floor(currentDate.getTime() / 1000)}
                </div>
                <div className="text-muted-foreground mt-1 text-sm">giây</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="format">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="format" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Định dạng</span>
            </TabsTrigger>
            <TabsTrigger value="timezone" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Múi giờ</span>
            </TabsTrigger>
            <TabsTrigger value="calculate" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span>Tính toán</span>
            </TabsTrigger>
            <TabsTrigger value="difference" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              <span>Hiệu số</span>
            </TabsTrigger>
          </TabsList>

          {/* Format conversion tab */}
          <TabsContent value="format">
            <Card>
              <CardHeader>
                <CardTitle>Chuyển đổi định dạng</CardTitle>
                <CardDescription>
                  Chuyển đổi giữa các định dạng ngày giờ khác nhau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">
                      Ngày giờ đầu vào
                    </label>
                    <div className="grid gap-2">
                      <Select
                        value={inputFormat}
                        onValueChange={setInputFormat}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn định dạng" />
                        </SelectTrigger>
                        <SelectContent>
                          {dateFormats.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={inputDate}
                        onChange={(e) => setInputDate(e.target.value)}
                        placeholder={getInputPlaceholder()}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <label className="text-sm font-medium">
                      Định dạng đầu ra
                    </label>
                    <div className="grid gap-2">
                      <Select
                        value={outputFormat}
                        onValueChange={setOutputFormat}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn định dạng" />
                        </SelectTrigger>
                        <SelectContent>
                          {dateFormats.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {outputFormat === "custom" && (
                        <Input
                          value={customOutputFormat}
                          onChange={(e) =>
                            setCustomOutputFormat(e.target.value)
                          }
                          placeholder="YYYY-MM-DD HH:mm:ss"
                        />
                      )}
                    </div>
                  </div>

                  <Button onClick={convertFormat} className="w-full">
                    Chuyển đổi
                  </Button>

                  {error && (
                    <div className="text-destructive text-sm">{error}</div>
                  )}

                  {convertedDate && (
                    <div className="mt-4 rounded-md border p-4">
                      <div className="mb-1 text-sm font-medium">Kết quả</div>
                      <div className="font-mono break-all">{convertedDate}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timezone conversion tab */}
          <TabsContent value="timezone">
            <Card>
              <CardHeader>
                <CardTitle>Chuyển đổi múi giờ</CardTitle>
                <CardDescription>
                  Chuyển đổi thời gian giữa các múi giờ khác nhau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">
                      Ngày giờ (định dạng ISO)
                    </label>
                    <Input
                      type="datetime-local"
                      value={timezoneDate}
                      onChange={(e) => setTimezoneDate(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">
                        Múi giờ nguồn
                      </label>
                      <Select
                        value={sourceTimezone}
                        onValueChange={setSourceTimezone}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn múi giờ" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeZones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Múi giờ đích
                      </label>
                      <Select
                        value={targetTimezone}
                        onValueChange={setTargetTimezone}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn múi giờ" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeZones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={convertTimezone} className="w-full">
                    Chuyển đổi
                  </Button>

                  {error && (
                    <div className="text-destructive text-sm">{error}</div>
                  )}

                  {convertedTimezoneDate && (
                    <div className="mt-4 rounded-md border p-4">
                      <div className="mb-1 text-sm font-medium">Kết quả</div>
                      <div className="font-mono break-all">
                        {convertedTimezoneDate}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Date calculation tab */}
          <TabsContent value="calculate">
            <Card>
              <CardHeader>
                <CardTitle>Tính toán ngày giờ</CardTitle>
                <CardDescription>
                  Cộng hoặc trừ một khoảng thời gian từ một ngày cụ thể
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">
                      Ngày giờ cơ sở
                    </label>
                    <Input
                      type="datetime-local"
                      value={baseDate}
                      onChange={(e) => setBaseDate(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium">Phép tính</label>
                      <Select
                        value={calcOperation}
                        onValueChange={setCalcOperation}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phép tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add">Cộng (+)</SelectItem>
                          <SelectItem value="subtract">Trừ (-)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Giá trị</label>
                      <Input
                        type="number"
                        value={calcValue}
                        onChange={(e) => setCalcValue(Number(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Đơn vị</label>
                      <Select value={calcUnit} onValueChange={setCalcUnit}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn đơn vị" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="years">Năm</SelectItem>
                          <SelectItem value="months">Tháng</SelectItem>
                          <SelectItem value="days">Ngày</SelectItem>
                          <SelectItem value="hours">Giờ</SelectItem>
                          <SelectItem value="minutes">Phút</SelectItem>
                          <SelectItem value="seconds">Giây</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={calculateDate} className="w-full">
                    Tính toán
                  </Button>

                  {error && (
                    <div className="text-destructive text-sm">{error}</div>
                  )}

                  {calculatedDate && (
                    <div className="mt-4 rounded-md border p-4">
                      <div className="mb-1 text-sm font-medium">Kết quả</div>
                      <div className="font-mono break-all">
                        {calculatedDate}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Date difference tab */}
          <TabsContent value="difference">
            <Card>
              <CardHeader>
                <CardTitle>Hiệu số thời gian</CardTitle>
                <CardDescription>
                  Tính khoảng cách giữa hai thời điểm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">
                        Ngày giờ bắt đầu
                      </label>
                      <Input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Ngày giờ kết thúc
                      </label>
                      <Input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={calculateDifference} className="w-full">
                    Tính hiệu số
                  </Button>

                  {error && (
                    <div className="text-destructive text-sm">{error}</div>
                  )}

                  {(dateDifference.days > 0 ||
                    dateDifference.hours > 0 ||
                    dateDifference.minutes > 0 ||
                    dateDifference.seconds > 0) && (
                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                      <div className="rounded-md border p-4 text-center">
                        <div className="text-2xl font-bold">
                          {dateDifference.days}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Ngày
                        </div>
                      </div>
                      <div className="rounded-md border p-4 text-center">
                        <div className="text-2xl font-bold">
                          {dateDifference.hours}
                        </div>
                        <div className="text-muted-foreground text-sm">Giờ</div>
                      </div>
                      <div className="rounded-md border p-4 text-center">
                        <div className="text-2xl font-bold">
                          {dateDifference.minutes}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Phút
                        </div>
                      </div>
                      <div className="rounded-md border p-4 text-center">
                        <div className="text-2xl font-bold">
                          {dateDifference.seconds}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Giây
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
