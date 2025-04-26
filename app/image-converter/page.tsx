"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, Image as ImageIcon, UploadCloud, X } from "lucide-react"
import { useDropzone } from "react-dropzone"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SupportedFormat = "jpeg" | "png" | "webp" | "bmp" | "gif"
type ResizeOption = "original" | "small" | "medium" | "large" | "custom"
type FilterOption = "none" | "grayscale" | "sepia" | "invert" | "blur"

interface ImageFile {
  file: File
  preview: string
  name: string
  size: string
  type: string
}

export default function ImageConverter() {
  const [imageFile, setImageFile] = useState<ImageFile | null>(null)
  const [convertedImage, setConvertedImage] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>("webp")
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Advanced options
  const [quality, setQuality] = useState<number>(90)
  const [resizeOption, setResizeOption] = useState<ResizeOption>("original")
  const [customWidth, setCustomWidth] = useState<number>(800)
  const [customHeight, setCustomHeight] = useState<number>(600)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true)
  const [filterOption, setFilterOption] = useState<FilterOption>("none")

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ")
      return
    }

    setError(null)
    setConvertedImage(null)

    const reader = new FileReader()
    reader.onload = () => {
      setImageFile({
        file,
        preview: reader.result as string,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
      })
    }
    reader.readAsDataURL(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif", ".bmp"],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  })

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imageFile?.preview) URL.revokeObjectURL(imageFile.preview)
      if (convertedImage) URL.revokeObjectURL(convertedImage)
    }
  }, [imageFile, convertedImage])

  const applyFilter = (
    ctx: CanvasRenderingContext2D,
    filter: FilterOption,
    width: number,
    height: number
  ) => {
    if (filter === "none") return

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    switch (filter) {
      case "grayscale":
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg // R
          data[i + 1] = avg // G
          data[i + 2] = avg // B
        }
        break
      case "sepia":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        }
        break
      case "invert":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i] // R
          data[i + 1] = 255 - data[i + 1] // G
          data[i + 2] = 255 - data[i + 2] // B
        }
        break
      case "blur":
        // Apply a simple blur effect (this is a very basic implementation)
        ctx.filter = "blur(5px)"
        ctx.drawImage(new Image(), 0, 0, width, height)
        ctx.filter = "none"
        return // Return early since we redrew the image
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const calculateDimensions = (
    originalWidth: number,
    originalHeight: number
  ) => {
    if (resizeOption === "original") {
      return { width: originalWidth, height: originalHeight }
    }

    if (resizeOption === "custom") {
      if (maintainAspectRatio) {
        const ratio = originalWidth / originalHeight
        if (customWidth > 0 && customHeight > 0) {
          // Determine which dimension to use as the constraint
          if (customWidth / customHeight > ratio) {
            return {
              width: Math.round(customHeight * ratio),
              height: customHeight,
            }
          } else {
            return {
              width: customWidth,
              height: Math.round(customWidth / ratio),
            }
          }
        } else if (customWidth > 0) {
          return { width: customWidth, height: Math.round(customWidth / ratio) }
        } else if (customHeight > 0) {
          return {
            width: Math.round(customHeight * ratio),
            height: customHeight,
          }
        }
      } else {
        return {
          width: customWidth || originalWidth,
          height: customHeight || originalHeight,
        }
      }
    }

    // Predefined sizes
    const sizes = {
      small: { maxWidth: 640, maxHeight: 480 },
      medium: { maxWidth: 1280, maxHeight: 720 },
      large: { maxWidth: 1920, maxHeight: 1080 },
    }

    // Make sure we're only using predefined sizes here
    const sizeOption = resizeOption as "small" | "medium" | "large"
    const selected = sizes[sizeOption]
    const ratio = originalWidth / originalHeight

    if (
      originalWidth <= selected.maxWidth &&
      originalHeight <= selected.maxHeight
    ) {
      return { width: originalWidth, height: originalHeight }
    }

    if (
      originalWidth / selected.maxWidth >
      originalHeight / selected.maxHeight
    ) {
      return {
        width: selected.maxWidth,
        height: Math.round(selected.maxWidth / ratio),
      }
    } else {
      return {
        width: Math.round(selected.maxHeight * ratio),
        height: selected.maxHeight,
      }
    }
  }

  const convertImage = async () => {
    if (!imageFile) return

    try {
      setIsConverting(true)
      setError(null)

      // Create a canvas to convert the image
      const img = new Image()
      img.src = imageFile.preview

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const { width, height } = calculateDimensions(img.width, img.height)

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Không thể tạo context canvas")
      }

      // Draw the image with the new dimensions
      ctx.drawImage(img, 0, 0, width, height)

      // Apply selected filter
      applyFilter(ctx, filterOption, width, height)

      // Convert to the selected format
      const mimeType = `image/${targetFormat}`
      const conversionQuality = targetFormat === "jpeg" ? quality / 100 : 1 // JPEG uses quality

      const dataUrl = canvas.toDataURL(mimeType, conversionQuality)
      setConvertedImage(dataUrl)
    } catch (err) {
      console.error(err)
      setError("Có lỗi xảy ra khi chuyển đổi định dạng ảnh. Vui lòng thử lại.")
    } finally {
      setIsConverting(false)
    }
  }

  const downloadImage = () => {
    if (!convertedImage || !imageFile) return

    const link = document.createElement("a")
    link.href = convertedImage

    // Generate new filename with the target format extension
    const originalNameWithoutExt = imageFile.name
      .split(".")
      .slice(0, -1)
      .join(".")
    const newFilename = `${originalNameWithoutExt}.${targetFormat}`

    link.download = newFilename
    link.click()
  }

  const resetImage = () => {
    setImageFile(null)
    setConvertedImage(null)
    setError(null)
  }

  const formatOptions: { value: SupportedFormat; label: string }[] = [
    { value: "jpeg", label: "JPEG" },
    { value: "png", label: "PNG" },
    { value: "webp", label: "WebP" },
    { value: "bmp", label: "BMP" },
    { value: "gif", label: "GIF" },
  ]

  const resizeOptions: { value: ResizeOption; label: string }[] = [
    { value: "original", label: "Kích thước gốc" },
    { value: "small", label: "Nhỏ (640×480)" },
    { value: "medium", label: "Vừa (1280×720)" },
    { value: "large", label: "Lớn (1920×1080)" },
    { value: "custom", label: "Tùy chỉnh" },
  ]

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: "none", label: "Không" },
    { value: "grayscale", label: "Trắng đen" },
    { value: "sepia", label: "Sepia" },
    { value: "invert", label: "Âm bản" },
    { value: "blur", label: "Làm mờ" },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">Chuyển đổi định dạng ảnh</h1>
          <p className="text-muted-foreground">
            Tải lên ảnh của bạn và chuyển đổi sang các định dạng khác nhau
            (JPEG, PNG, WebP, BMP, GIF)
          </p>
        </div>

        {!imageFile ? (
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50 border-gray-300"
            )}
          >
            <input {...getInputProps()} />
            <UploadCloud className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="mb-2 text-lg font-medium">
              {isDragActive
                ? "Thả ảnh vào đây"
                : "Kéo và thả ảnh của bạn vào đây"}
            </p>
            <p className="text-muted-foreground text-sm">
              Hỗ trợ các định dạng: JPEG, PNG, WebP, BMP, GIF (tối đa 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Ảnh gốc</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetImage}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-4 w-4" />
                Xóa
              </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Original image card */}
              <div className="bg-card overflow-hidden rounded-lg border">
                <div className="relative aspect-square">
                  <img
                    src={imageFile.preview}
                    alt="Original"
                    className="h-full w-full object-contain p-4"
                  />
                </div>
                <div className="border-t p-4">
                  <div className="flex items-start space-x-3">
                    <ImageIcon className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium break-all">{imageFile.name}</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {imageFile.size} ·{" "}
                        {imageFile.type.split("/")[1].toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion options & result */}
              <div className="flex h-full flex-col">
                <div className="bg-card mb-4 rounded-lg border p-4">
                  <h3 className="mb-4 font-medium">Tùy chọn chuyển đổi</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Chọn định dạng đầu ra:
                      </label>
                      <Select
                        value={targetFormat}
                        onValueChange={(value) =>
                          setTargetFormat(value as SupportedFormat)
                        }
                        disabled={isConverting}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn định dạng" />
                        </SelectTrigger>
                        <SelectContent>
                          {formatOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {targetFormat === "jpeg" && (
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Chất lượng ảnh: {quality}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={quality}
                          onChange={(e) => setQuality(parseInt(e.target.value))}
                          className="w-full"
                          disabled={isConverting}
                        />
                        <div className="text-muted-foreground flex justify-between text-xs">
                          <span>10%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Kích thước ảnh:
                      </label>
                      <Select
                        value={resizeOption}
                        onValueChange={(value) =>
                          setResizeOption(value as ResizeOption)
                        }
                        disabled={isConverting}
                      >
                        <SelectTrigger className="mb-2 w-full">
                          <SelectValue placeholder="Chọn kích thước" />
                        </SelectTrigger>
                        <SelectContent>
                          {resizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {resizeOption === "custom" && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-1 block text-xs">
                              Chiều rộng (px):
                            </label>
                            <Input
                              type="number"
                              value={customWidth}
                              onChange={(e) =>
                                setCustomWidth(parseInt(e.target.value) || 0)
                              }
                              className="w-full"
                              disabled={isConverting}
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs">
                              Chiều cao (px):
                            </label>
                            <Input
                              type="number"
                              value={customHeight}
                              onChange={(e) =>
                                setCustomHeight(parseInt(e.target.value) || 0)
                              }
                              className="w-full"
                              disabled={isConverting}
                              min="1"
                            />
                          </div>
                          <div className="col-span-2 mt-1">
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={maintainAspectRatio}
                                onChange={() =>
                                  setMaintainAspectRatio(!maintainAspectRatio)
                                }
                                className="mr-2 h-3 w-3"
                                disabled={isConverting}
                              />
                              Giữ tỷ lệ khung hình
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Hiệu ứng:
                      </label>
                      <Select
                        value={filterOption}
                        onValueChange={(value) =>
                          setFilterOption(value as FilterOption)
                        }
                        disabled={isConverting}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn hiệu ứng" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={convertImage}
                      disabled={isConverting || !imageFile}
                      className="w-full"
                    >
                      {isConverting ? "Đang chuyển đổi..." : "Chuyển đổi ảnh"}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/15 text-destructive mb-4 rounded-md p-3 text-sm">
                    {error}
                  </div>
                )}

                {convertedImage && (
                  <div className="bg-card flex flex-grow flex-col overflow-hidden rounded-lg border">
                    <div className="border-b p-4">
                      <h3 className="font-medium">
                        Ảnh đã chuyển đổi ({targetFormat.toUpperCase()})
                      </h3>
                    </div>
                    <div className="flex flex-grow items-center justify-center p-4">
                      <img
                        src={convertedImage}
                        alt="Converted"
                        className="max-h-[200px] max-w-full object-contain"
                      />
                    </div>
                    <div className="border-t p-4">
                      <Button
                        onClick={downloadImage}
                        className="flex w-full items-center justify-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Tải xuống {targetFormat.toUpperCase()}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
