"use client"

import { useEffect, useState } from "react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Copy,
  RefreshCw,
} from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

export default function JsonFormatter() {
  const [input, setInput] = useState<string>("")
  const [output, setOutput] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [indentSize, setIndentSize] = useState<number>(2)

  useEffect(() => {
    formatJson()
  }, [input, indentSize])

  const formatJson = () => {
    if (!input.trim()) {
      setOutput("")
      setError(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indentSize))
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Invalid JSON")
      }
      setOutput("")
    }
  }

  const minifyJson = () => {
    if (!input.trim()) {
      setOutput("")
      setError(null)
      return
    }

    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError(null)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Invalid JSON")
      }
      setOutput("")
    }
  }

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text)
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err)
    }
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setError(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">JSON Formatter</h1>
        <p className="text-muted-foreground mt-2">
          Format, validate and beautify JSON data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Input</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePaste}
                className="hover:bg-muted flex items-center rounded-md border px-3 py-1.5 text-xs font-medium"
                title="Paste from Clipboard"
              >
                <ArrowDownToLine className="mr-1 h-3.5 w-3.5" />
                Paste
              </button>
              <button
                onClick={clearAll}
                className="hover:bg-muted flex items-center rounded-md border px-3 py-1.5 text-xs font-medium"
                title="Clear All"
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="bg-background min-h-[400px] w-full rounded-md border p-4 font-mono text-sm"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Output</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={minifyJson}
                className="hover:bg-muted flex items-center rounded-md border px-3 py-1.5 text-xs font-medium"
                disabled={!input.trim()}
                title="Minify JSON"
              >
                <ArrowUpFromLine className="mr-1 h-3.5 w-3.5" />
                Minify
              </button>
              <button
                onClick={copyToClipboard}
                className="hover:bg-muted flex items-center rounded-md border px-3 py-1.5 text-xs font-medium"
                disabled={!output}
                title="Copy to Clipboard"
              >
                {copied ? (
                  <Check className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <Copy className="mr-1 h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="bg-background min-h-[400px] overflow-auto rounded-md border">
            {error ? (
              <div className="p-4 text-sm text-red-500">
                <p className="font-medium">Error:</p>
                <p className="font-mono">{error}</p>
              </div>
            ) : output ? (
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "16px",
                  borderRadius: "0.375rem",
                  height: "100%",
                  minHeight: "400px",
                }}
              >
                {output}
              </SyntaxHighlighter>
            ) : (
              <div className="text-muted-foreground flex h-full min-h-[400px] items-center justify-center text-sm">
                Formatted JSON will appear here
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-4">
        <h3 className="mb-3 font-medium">Options</h3>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <label htmlFor="indent-size" className="text-sm">
              Indent Size:
            </label>
            <select
              id="indent-size"
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="bg-background rounded-md border px-2 py-1 text-sm"
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="8">8 Spaces</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
