"use client"

import { useEffect, useState } from "react"
import { Copy, RefreshCcw } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

// Types
type GeneratorType = "number" | "string" | "uuid" | "color" | "date" | "name"

// Random name options
const firstNames = [
  "Anh",
  "Binh",
  "Cuong",
  "Dung",
  "Huong",
  "Lan",
  "Mai",
  "Nam",
  "Phuong",
  "Quang",
  "Thanh",
  "Tuan",
  "Viet",
  "Xuan",
  "Yen",
  "John",
  "Mary",
  "James",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Susan",
  "Richard",
  "Jessica",
  "Joseph",
]

const lastNames = [
  "Nguyen",
  "Tran",
  "Le",
  "Pham",
  "Hoang",
  "Huynh",
  "Vu",
  "Bui",
  "Do",
  "Dang",
  "Dinh",
  "Trinh",
  "Vo",
  "Ngo",
  "Duong",
  "Smith",
  "Johnson",
  "Williams",
  "Jones",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Taylor",
  "Clark",
  "Hall",
  "White",
  "Harris",
  "Martin",
  "Thompson",
]

export default function RandomGenerator() {
  const [generatorType, setGeneratorType] = useState<GeneratorType>("number")
  const [generatedValue, setGeneratedValue] = useState<string>("")
  const [copySuccess, setCopySuccess] = useState<boolean>(false)

  // Number generator settings
  const [minNumber, setMinNumber] = useState<number>(1)
  const [maxNumber, setMaxNumber] = useState<number>(100)
  const [decimals, setDecimals] = useState<number>(0)

  // String generator settings
  const [stringLength, setStringLength] = useState<number>(10)
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true)
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true)
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true)
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(false)

  // Name generator settings
  const [includeFirstName, setIncludeFirstName] = useState<boolean>(true)
  const [includeLastName, setIncludeLastName] = useState<boolean>(true)
  const [nameCount, setNameCount] = useState<number>(1)

  // Date generator settings
  const [startDate, setStartDate] = useState<string>("2000-01-01")
  const [endDate, setEndDate] = useState<string>("2030-12-31")

  // Generate random value based on type
  const generateRandomValue = () => {
    setCopySuccess(false)

    switch (generatorType) {
      case "number":
        const min = Math.min(minNumber, maxNumber)
        const max = Math.max(minNumber, maxNumber)
        const randomNumber = min + Math.random() * (max - min)
        setGeneratedValue(randomNumber.toFixed(decimals))
        break

      case "string":
        const chars = [
          includeLowercase ? "abcdefghijklmnopqrstuvwxyz" : "",
          includeUppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
          includeNumbers ? "0123456789" : "",
          includeSymbols ? "!@#$%^&*()_+-=[]{}|;:,.<>?/" : "",
        ].join("")

        if (chars.length === 0) {
          setGeneratedValue("Vui lòng chọn ít nhất một tùy chọn")
          return
        }

        let result = ""
        for (let i = 0; i < stringLength; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setGeneratedValue(result)
        break

      case "uuid":
        setGeneratedValue(uuidv4())
        break

      case "color":
        const randomColor =
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")
        setGeneratedValue(randomColor)
        break

      case "date":
        const startTimestamp = new Date(startDate).getTime()
        const endTimestamp = new Date(endDate).getTime()

        if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
          setGeneratedValue("Ngày không hợp lệ")
          return
        }

        const randomTimestamp =
          startTimestamp + Math.random() * (endTimestamp - startTimestamp)
        const randomDate = new Date(randomTimestamp)
        setGeneratedValue(randomDate.toISOString().split("T")[0])
        break

      case "name":
        const names = []
        for (let i = 0; i < nameCount; i++) {
          let name = ""
          if (includeFirstName) {
            name += firstNames[Math.floor(Math.random() * firstNames.length)]
          }
          if (includeFirstName && includeLastName) {
            name += " "
          }
          if (includeLastName) {
            name += lastNames[Math.floor(Math.random() * lastNames.length)]
          }
          names.push(name)
        }
        setGeneratedValue(names.join(", "))
        break
    }
  }

  // Copy generated value to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedValue)
    setCopySuccess(true)

    setTimeout(() => {
      setCopySuccess(false)
    }, 2000)
  }

  // Generate random value on type change or initial load
  useEffect(() => {
    generateRandomValue()
  }, [generatorType])

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Random Generator</h1>
          <p className="text-muted-foreground">
            Tạo các giá trị ngẫu nhiên cho số, chuỗi, UUID, màu sắc, ngày tháng
            và tên
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Tùy chọn</CardTitle>
                <CardDescription>Chọn loại dữ liệu và cài đặt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Loại dữ liệu
                    </label>
                    <Select
                      value={generatorType}
                      onValueChange={(value) =>
                        setGeneratorType(value as GeneratorType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại dữ liệu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Số ngẫu nhiên</SelectItem>
                        <SelectItem value="string">Chuỗi ngẫu nhiên</SelectItem>
                        <SelectItem value="uuid">UUID</SelectItem>
                        <SelectItem value="color">Màu sắc</SelectItem>
                        <SelectItem value="date">Ngày tháng</SelectItem>
                        <SelectItem value="name">Tên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Tabs value={generatorType} className="mt-4">
                    <TabsContent value="number" className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Giá trị nhỏ nhất
                        </label>
                        <Input
                          type="number"
                          value={minNumber}
                          onChange={(e) => setMinNumber(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Giá trị lớn nhất
                        </label>
                        <Input
                          type="number"
                          value={maxNumber}
                          onChange={(e) => setMaxNumber(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Số chữ số thập phân
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={decimals}
                          onChange={(e) => setDecimals(Number(e.target.value))}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="string" className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Độ dài chuỗi
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={stringLength}
                          onChange={(e) =>
                            setStringLength(Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Bao gồm ký tự
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="includeUppercase"
                              checked={includeUppercase}
                              onChange={() =>
                                setIncludeUppercase(!includeUppercase)
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label
                              htmlFor="includeUppercase"
                              className="ml-2 text-sm"
                            >
                              Chữ hoa (A-Z)
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="includeLowercase"
                              checked={includeLowercase}
                              onChange={() =>
                                setIncludeLowercase(!includeLowercase)
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label
                              htmlFor="includeLowercase"
                              className="ml-2 text-sm"
                            >
                              Chữ thường (a-z)
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="includeNumbers"
                              checked={includeNumbers}
                              onChange={() =>
                                setIncludeNumbers(!includeNumbers)
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label
                              htmlFor="includeNumbers"
                              className="ml-2 text-sm"
                            >
                              Số (0-9)
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="includeSymbols"
                              checked={includeSymbols}
                              onChange={() =>
                                setIncludeSymbols(!includeSymbols)
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label
                              htmlFor="includeSymbols"
                              className="ml-2 text-sm"
                            >
                              Ký hiệu (!@#$%^&*...)
                            </label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="uuid">
                      <p className="text-muted-foreground mt-2 text-sm">
                        Tạo UUID v4 (Universally Unique Identifier) có độ dài 36
                        ký tự.
                      </p>
                    </TabsContent>

                    <TabsContent value="color">
                      <p className="text-muted-foreground mt-2 text-sm">
                        Tạo mã màu HEX ngẫu nhiên (ví dụ: #FF5733).
                      </p>
                    </TabsContent>

                    <TabsContent value="date" className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Ngày bắt đầu
                        </label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Ngày kết thúc
                        </label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="name" className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Số lượng tên
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={nameCount}
                          onChange={(e) => setNameCount(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">
                          Bao gồm
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="includeFirstName"
                              checked={includeFirstName}
                              onChange={() =>
                                setIncludeFirstName(!includeFirstName)
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label
                              htmlFor="includeFirstName"
                              className="ml-2 text-sm"
                            >
                              Tên
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="includeLastName"
                              checked={includeLastName}
                              onChange={() =>
                                setIncludeLastName(!includeLastName)
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <label
                              htmlFor="includeLastName"
                              className="ml-2 text-sm"
                            >
                              Họ
                            </label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={generateRandomValue}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Tạo mới
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-8">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">Kết quả</CardTitle>
                <CardDescription>Giá trị ngẫu nhiên đã tạo</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[200px]">
                {generatorType === "color" ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div
                      className="h-32 w-32 rounded-md border"
                      style={{ backgroundColor: generatedValue }}
                    />
                    <div className="text-center text-xl font-medium">
                      {generatedValue}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border p-4 font-mono break-all">
                    {generatedValue}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={generateRandomValue}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Tạo mới
                </Button>
                <Button onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copySuccess ? "Đã sao chép!" : "Sao chép"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
