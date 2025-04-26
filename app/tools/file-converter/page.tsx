"use client"

import { useState } from "react"
import { saveAs } from "file-saver"
import {
  AlertTriangle,
  Download,
  FileType,
  Trash,
  UploadCloud,
} from "lucide-react"
import { useDropzone } from "react-dropzone"

// Define conversion types
type ConversionType = {
  id: string
  label: string
  from: string
  to: string
  converter: (file: File) => Promise<Blob | null>
  disabled?: boolean
}

export default function FileConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [convertedFile, setConvertedFile] = useState<Blob | null>(null)
  const [selectedConversion, setSelectedConversion] =
    useState<string>("txt-to-json")
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Define available conversions
  const conversions: ConversionType[] = [
    {
      id: "txt-to-json",
      label: "Text to JSON",
      from: "txt",
      to: "json",
      converter: async (file: File) => {
        try {
          const text = await file.text()
          // Simple conversion - split by lines and create an array
          const lines = text.split("\n").filter((line) => line.trim() !== "")
          const jsonObj = { lines }
          return new Blob([JSON.stringify(jsonObj, null, 2)], {
            type: "application/json",
          })
        } catch (err) {
          setError("Failed to convert text to JSON")
          return null
        }
      },
    },
    {
      id: "json-to-csv",
      label: "JSON to CSV",
      from: "json",
      to: "csv",
      converter: async (file: File) => {
        try {
          const text = await file.text()
          const json = JSON.parse(text)

          // Handle arrays of objects
          if (
            Array.isArray(json) &&
            json.length > 0 &&
            typeof json[0] === "object"
          ) {
            const headers = Object.keys(json[0])
            const csvRows = [
              headers.join(","),
              ...json.map((row) =>
                headers
                  .map((header) => {
                    let cell =
                      row[header] === null || row[header] === undefined
                        ? ""
                        : row[header]
                    cell =
                      typeof cell === "object"
                        ? JSON.stringify(cell)
                        : String(cell)
                    // Escape quotes and wrap in quotes if contains commas or quotes
                    if (
                      cell.includes('"') ||
                      cell.includes(",") ||
                      cell.includes("\n")
                    ) {
                      cell = `"${cell.replace(/"/g, '""')}"`
                    }
                    return cell
                  })
                  .join(",")
              ),
            ]
            return new Blob([csvRows.join("\n")], { type: "text/csv" })
          } else {
            setError("JSON must be an array of objects")
            return null
          }
        } catch (err) {
          setError(
            "Failed to convert JSON to CSV. Make sure the JSON is valid."
          )
          return null
        }
      },
    },
    {
      id: "csv-to-json",
      label: "CSV to JSON",
      from: "csv",
      to: "json",
      converter: async (file: File) => {
        try {
          const text = await file.text()
          const lines = text.split("\n").filter((line) => line.trim() !== "")

          if (lines.length < 1) {
            setError("CSV file is empty")
            return null
          }

          const headers = lines[0].split(",").map((header) => header.trim())
          const result = []

          for (let i = 1; i < lines.length; i++) {
            const obj: Record<string, string> = {}
            const currentLine = lines[i].split(",")

            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : ""
            }

            result.push(obj)
          }

          return new Blob([JSON.stringify(result, null, 2)], {
            type: "application/json",
          })
        } catch (err) {
          setError("Failed to convert CSV to JSON")
          return null
        }
      },
    },
    {
      id: "json-to-yaml",
      label: "JSON to YAML",
      from: "json",
      to: "yaml",
      converter: async (file: File) => {
        try {
          const text = await file.text()
          const json = JSON.parse(text)

          // Simple converter
          const convertToYaml = (obj: any, indent = 0): string => {
            let yaml = ""
            const spaces = " ".repeat(indent)

            if (Array.isArray(obj)) {
              if (obj.length === 0) return spaces + "[]"

              for (const item of obj) {
                if (typeof item === "object" && item !== null) {
                  yaml += spaces + "-\n" + convertToYaml(item, indent + 2)
                } else {
                  yaml +=
                    spaces +
                    "- " +
                    (typeof item === "string" ? `"${item}"` : item) +
                    "\n"
                }
              }
            } else if (typeof obj === "object" && obj !== null) {
              for (const [key, value] of Object.entries(obj)) {
                if (typeof value === "object" && value !== null) {
                  yaml +=
                    spaces + key + ":\n" + convertToYaml(value, indent + 2)
                } else if (typeof value === "string") {
                  yaml += spaces + key + ': "' + value + '"\n'
                } else {
                  yaml += spaces + key + ": " + value + "\n"
                }
              }
            }

            return yaml
          }

          const yamlText = convertToYaml(json)
          return new Blob([yamlText], { type: "text/yaml" })
        } catch (err) {
          setError(
            "Failed to convert JSON to YAML. Make sure the JSON is valid."
          )
          return null
        }
      },
    },
    {
      id: "image-converter",
      label: "Image Format Converter",
      from: "image",
      to: "image",
      converter: async () => {
        setError(
          "Browser-based image conversion is not supported in this version."
        )
        return null
      },
      disabled: true,
    },
  ]

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const currentConversion =
    conversions.find((c) => c.id === selectedConversion) || conversions[0]

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
        setConvertedFile(null)
        setError(null)
      }
    },
    maxFiles: 1,
    accept: {
      "text/plain": [".txt"],
      "application/json": [".json"],
      "text/csv": [".csv"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
    },
  })

  const convertFile = async () => {
    if (!file || !currentConversion) return

    setConverting(true)
    setError(null)

    try {
      // Check if file extension matches expected type
      const fileExt = file.name.split(".").pop()?.toLowerCase()
      if (
        currentConversion.from !== "image" &&
        fileExt !== currentConversion.from
      ) {
        setError(
          `Expected a .${currentConversion.from} file but got a .${fileExt} file`
        )
        setConverting(false)
        return
      }

      const result = await currentConversion.converter(file)
      if (result) {
        setConvertedFile(result)
      }
    } catch (err) {
      setError("Conversion failed. Please check your file and try again.")
    } finally {
      setConverting(false)
    }
  }

  const downloadConvertedFile = () => {
    if (!convertedFile || !file) return

    const originalFileName = file.name.split(".")[0]
    saveAs(convertedFile, `${originalFileName}.${currentConversion.to}`)
  }

  const clearFile = () => {
    setFile(null)
    setConvertedFile(null)
    setError(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">File Converter</h1>
        <p className="text-muted-foreground mt-2">
          Convert files between different formats
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Select Conversion Type</h2>
          <div className="bg-card rounded-lg border">
            <div className="space-y-4 p-4">
              <div className="grid gap-3">
                {conversions.map((conversion) => (
                  <label
                    key={conversion.id}
                    className={`flex items-center rounded-md border p-3 ${
                      selectedConversion === conversion.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    } ${conversion.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  >
                    <input
                      type="radio"
                      name="conversion"
                      value={conversion.id}
                      checked={selectedConversion === conversion.id}
                      onChange={() => setSelectedConversion(conversion.id)}
                      disabled={conversion.disabled}
                      className="mr-3 h-4 w-4"
                    />
                    <div>
                      <p className="font-medium">{conversion.label}</p>
                      <p className="text-muted-foreground text-xs">
                        {conversion.from.toUpperCase()} to{" "}
                        {conversion.to.toUpperCase()}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium">Upload File</h2>
          {!file ? (
            <div
              {...getRootProps()}
              className="hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center"
            >
              <input {...getInputProps()} />
              <UploadCloud className="text-muted-foreground mb-4 h-10 w-10" />
              <p className="mb-2 text-sm font-medium">
                Drag and drop your file here
              </p>
              <p className="text-muted-foreground text-xs">
                {currentConversion.from === "image"
                  ? "Supports JPG, PNG, GIF (up to 5MB)"
                  : `Supports ${currentConversion.from.toUpperCase()} files (up to 5MB)`}
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-lg border">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <FileType className="text-primary mr-3 h-8 w-8" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="text-muted-foreground hover:bg-muted rounded-full p-1"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="border-t p-4">
                <button
                  onClick={convertFile}
                  disabled={converting || currentConversion.disabled}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {converting
                    ? "Converting..."
                    : `Convert to ${currentConversion.to.toUpperCase()}`}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/15 text-destructive flex items-start rounded-md p-4 text-sm">
              <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {convertedFile && (
            <div className="bg-card rounded-lg border">
              <div className="p-4">
                <h3 className="font-medium">Conversion Complete</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Your file has been successfully converted
                </p>
              </div>
              <div className="border-t p-4">
                <button
                  onClick={downloadConvertedFile}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {currentConversion.to.toUpperCase()} File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
