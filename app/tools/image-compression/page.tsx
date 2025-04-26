"use client"

import { useState } from "react"
import imageCompression from "browser-image-compression"
import { saveAs } from "file-saver"
import { AlertCircle, Check, Download, UploadCloud } from "lucide-react"
import { useDropzone } from "react-dropzone"

export default function ImageCompression() {
  const [files, setFiles] = useState<
    Array<{ file: File; preview: string; size: string }>
  >([])
  const [compressedFiles, setCompressedFiles] = useState<
    Array<{ file: Blob; preview: string; size: string }>
  >([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    onDrop: (acceptedFiles) => {
      setError(null)

      const newFiles = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        size: formatFileSize(file.size),
      }))

      setFiles(newFiles)
      setCompressedFiles([])
    },
  })

  const compressImages = async () => {
    try {
      setIsCompressing(true)
      setError(null)

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }

      const compressed = await Promise.all(
        files.map(async (fileObj) => {
          const compressedFile = await imageCompression(fileObj.file, options)
          return {
            file: compressedFile,
            preview: URL.createObjectURL(compressedFile),
            size: formatFileSize(compressedFile.size),
          }
        })
      )

      setCompressedFiles(compressed)
    } catch (err) {
      setError("An error occurred during compression. Please try again.")
      console.error(err)
    } finally {
      setIsCompressing(false)
    }
  }

  const downloadFile = (blob: Blob, fileName: string) => {
    saveAs(blob, `compressed-${fileName}`)
  }

  const downloadAll = () => {
    compressedFiles.forEach((fileObj, index) => {
      const originalName = files[index]?.file.name || `image-${index}.jpg`
      downloadFile(fileObj.file, originalName)
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Image Compression</h1>
        <p className="text-muted-foreground mt-2">
          Compress your images without losing significant quality
        </p>
      </div>

      <div
        {...getRootProps()}
        className="hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center"
      >
        <input {...getInputProps()} />
        <UploadCloud className="text-muted-foreground mb-4 h-10 w-10" />
        <p className="mb-2 text-sm font-medium">
          Drag and drop your images here
        </p>
        <p className="text-muted-foreground text-xs">
          Supports: JPG, PNG, WebP, GIF (up to 10MB)
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive flex items-center rounded-md p-4 text-sm">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Original Images</h2>
            <button
              onClick={compressImages}
              disabled={isCompressing}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCompressing ? "Compressing..." : "Compress All"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {files.map((fileObj, index) => (
              <div
                key={index}
                className="bg-background overflow-hidden rounded-lg border"
              >
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={fileObj.preview}
                    alt={`Preview ${index}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">
                    {fileObj.file.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {fileObj.size}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {compressedFiles.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Compressed Images</h2>
            <button
              onClick={downloadAll}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center rounded-md px-4 py-2 text-sm font-medium"
            >
              <Download className="mr-2 h-4 w-4" />
              Download All
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {compressedFiles.map((fileObj, index) => {
              const originalFile = files[index]
              const originalSize = originalFile?.file.size || 0
              const compressedSize = fileObj.file.size
              const savings =
                originalSize > 0
                  ? Math.round(
                      ((originalSize - compressedSize) / originalSize) * 100
                    )
                  : 0

              return (
                <div
                  key={index}
                  className="bg-background overflow-hidden rounded-lg border"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={fileObj.preview}
                      alt={`Compressed Preview ${index}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="truncate text-sm font-medium">
                        {originalFile?.file.name}
                      </p>
                      <button
                        onClick={() =>
                          downloadFile(
                            fileObj.file,
                            originalFile?.file.name || `image-${index}.jpg`
                          )
                        }
                        className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full p-1"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {fileObj.size} (Saved {savings}%)
                      </span>
                      <span className="flex items-center text-green-600">
                        <Check className="mr-1 h-3 w-3" />
                        Compressed
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
