"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Info } from "lucide-react"

export default function RegexChecker() {
  const [pattern, setPattern] = useState<string>("")
  const [testString, setTestString] = useState<string>("")
  const [flags, setFlags] = useState<string>("g")
  const [error, setError] = useState<string | null>(null)

  // Regex flags checkboxes
  const flagOptions = [
    { id: "global", label: "Global (g)", value: "g" },
    { id: "multiline", label: "Multiline (m)", value: "m" },
    { id: "insensitive", label: "Case Insensitive (i)", value: "i" },
    { id: "unicode", label: "Unicode (u)", value: "u" },
    { id: "sticky", label: "Sticky (y)", value: "y" },
    { id: "dotall", label: "Dot All (s)", value: "s" },
  ]

  const toggleFlag = (flagValue: string) => {
    setFlags((prevFlags) => {
      if (prevFlags.includes(flagValue)) {
        return prevFlags.replace(flagValue, "")
      } else {
        return prevFlags + flagValue
      }
    })
  }

  const regexResult = useMemo(() => {
    if (!pattern || !testString) {
      setError(null)
      return { matches: [], isValid: false }
    }

    try {
      const regex = new RegExp(pattern, flags)
      setError(null)

      // Extract all matches with their positions
      const matches: Array<{
        match: string
        index: number
        groups: Record<string, string> | null
      }> = []

      let result
      if (flags.includes("g")) {
        const allMatches = [...testString.matchAll(regex)]
        allMatches.forEach((match) => {
          matches.push({
            match: match[0],
            index: match.index || 0,
            groups: match.groups || null,
          })
        })
      } else {
        result = testString.match(regex)
        if (result) {
          matches.push({
            match: result[0],
            index: result.index || 0,
            groups: result.groups || null,
          })
        }
      }

      return { matches, isValid: true }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Invalid regular expression")
      }
      return { matches: [], isValid: false }
    }
  }, [pattern, testString, flags])

  // Create a highlighted version of the test string with matches highlighted
  const highlightedString = useMemo(() => {
    if (
      !testString ||
      !regexResult.isValid ||
      regexResult.matches.length === 0
    ) {
      return testString
    }

    // Sort matches by index in descending order to replace from the end
    // This prevents position shifts when replacing
    const sortedMatches = [...regexResult.matches].sort(
      (a, b) => b.index - a.index
    )

    let result = testString
    sortedMatches.forEach(({ match, index }) => {
      const before = result.substring(0, index)
      const after = result.substring(index + match.length)
      result = `${before}<mark class="bg-yellow-200 dark:bg-yellow-800">${match}</mark>${after}`
    })

    return result
  }, [testString, regexResult])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">RegEx Checker</h1>
        <p className="text-muted-foreground mt-2">
          Test and debug regular expressions with real-time feedback
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="regex-pattern"
            >
              Regular Expression Pattern
            </label>
            <input
              id="regex-pattern"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \d{3}-\d{2}-\d{4}"
              className="bg-background w-full rounded-md border px-3 py-2 font-mono text-sm"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="test-string"
            >
              Test String
            </label>
            <textarea
              id="test-string"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter text to test against the pattern..."
              className="bg-background min-h-[200px] w-full rounded-md border p-3 font-mono text-sm"
            />
          </div>

          <div>
            <p className="mb-2 block text-sm font-medium">Flags</p>
            <div className="flex flex-wrap gap-4">
              {flagOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-2 text-sm"
                  htmlFor={option.id}
                >
                  <input
                    id={option.id}
                    type="checkbox"
                    checked={flags.includes(option.value)}
                    onChange={() => toggleFlag(option.value)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium">Results</h2>

          {error && (
            <div className="bg-destructive/15 text-destructive flex items-start gap-2 rounded-md p-4 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error in Regular Expression</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          {!error && pattern && testString && (
            <div className="space-y-6">
              <div className="bg-card rounded-md border p-4">
                <h3 className="mb-2 text-sm font-medium">Match Results</h3>
                {regexResult.matches.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No matches found
                  </p>
                ) : (
                  <div>
                    <p className="mb-2 text-sm">
                      <span className="font-medium">
                        {regexResult.matches.length}
                      </span>{" "}
                      {regexResult.matches.length === 1 ? "match" : "matches"}{" "}
                      found
                    </p>
                    <div className="bg-background max-h-[200px] overflow-auto rounded border p-3">
                      <div className="space-y-2">
                        {regexResult.matches.map((match, index) => (
                          <div
                            key={index}
                            className="bg-muted rounded p-2 font-mono text-xs"
                          >
                            <p className="flex items-center justify-between">
                              <span className="font-medium">
                                Match {index + 1}:
                              </span>
                              <span className="text-muted-foreground">
                                Position: {match.index}
                              </span>
                            </p>
                            <p className="text-primary mt-1 font-medium break-all">
                              {match.match}
                            </p>
                            {match.groups &&
                              Object.keys(match.groups).length > 0 && (
                                <div className="border-border mt-2 border-t pt-2">
                                  <p className="font-medium">Groups:</p>
                                  {Object.entries(match.groups).map(
                                    ([name, value]) => (
                                      <div key={name} className="mt-1 flex">
                                        <span className="text-muted-foreground mr-2">
                                          {name}:
                                        </span>
                                        <span>{value}</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-card rounded-md border p-4">
                <h3 className="mb-2 text-sm font-medium">Highlighted Text</h3>
                <div
                  className="bg-background max-h-[300px] min-h-[100px] overflow-auto rounded border p-3 font-mono text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: highlightedString }}
                />
              </div>

              <div className="flex rounded-md border bg-blue-50 p-4 text-sm dark:bg-blue-950">
                <Info className="mr-2 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="text-blue-800 dark:text-blue-300">
                  <p className="font-medium">RegEx Tips</p>
                  <ul className="mt-1 list-inside list-disc space-y-1">
                    <li>
                      Use{" "}
                      <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">
                        \d
                      </code>{" "}
                      for digits,{" "}
                      <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">
                        \w
                      </code>{" "}
                      for word characters
                    </li>
                    <li>
                      Quantifiers:{" "}
                      <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">
                        *
                      </code>{" "}
                      (0 or more),{" "}
                      <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">
                        +
                      </code>{" "}
                      (1 or more),{" "}
                      <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">
                        ?
                      </code>{" "}
                      (0 or 1)
                    </li>
                    <li>
                      Use groups{" "}
                      <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">
                        (pattern)
                      </code>{" "}
                      to capture matches
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
