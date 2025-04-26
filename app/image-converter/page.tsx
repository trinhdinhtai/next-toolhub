"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, Image as ImageIcon, UploadCloud, X } from "lucide-react"
import { useDropzone } from "react-dropzone"

type SupportedFormat = "jpeg" | "png" | "webp" | "bmp" | "gif"

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

      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Không thể tạo context canvas")
      }

      ctx.drawImage(img, 0, 0)

      // Convert to the selected format
      const mimeType = `image/${targetFormat}`
      const quality = targetFormat === "jpeg" ? 0.9 : 1 // JPEG uses quality

      const dataUrl = canvas.toDataURL(mimeType, quality)
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
            className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50 border-gray-300"
            }`}
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
              <button
                onClick={resetImage}
                className="text-muted-foreground hover:text-foreground flex items-center text-sm"
              >
                <X className="mr-1 h-4 w-4" />
                Xóa
              </button>
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
                      <select
                        value={targetFormat}
                        onChange={(e) =>
                          setTargetFormat(e.target.value as SupportedFormat)
                        }
                        className="bg-background w-full rounded-md border px-3 py-2"
                        disabled={isConverting}
                      >
                        {formatOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={convertImage}
                      disabled={isConverting || !imageFile}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isConverting ? "Đang chuyển đổi..." : "Chuyển đổi ảnh"}
                    </button>
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
                      <button
                        onClick={downloadImage}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center rounded-md py-2 font-medium"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Tải xuống {targetFormat.toUpperCase()}
                      </button>
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
