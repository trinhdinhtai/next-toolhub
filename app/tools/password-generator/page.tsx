"use client"

import { useCallback, useState } from "react"
import { Check, Copy, RefreshCw, Sliders } from "lucide-react"

export default function PasswordGenerator() {
  const [password, setPassword] = useState<string>("")
  const [copied, setCopied] = useState<boolean>(false)
  const [length, setLength] = useState<number>(16)
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true)
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true)
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true)
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true)

  const generatePassword = useCallback(() => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const symbols = "!@#$%^&*()_+[]{}|;:,.<>?"

    let chars = ""
    if (includeUppercase) chars += uppercase
    if (includeLowercase) chars += lowercase
    if (includeNumbers) chars += numbers
    if (includeSymbols) chars += symbols

    if (chars === "") {
      setPassword("Please select at least one character type")
      return
    }

    let generatedPassword = ""
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      generatedPassword += chars[randomIndex]
    }

    setPassword(generatedPassword)
    setCopied(false)
  }, [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  ])

  const copyToClipboard = () => {
    if (password && password !== "Please select at least one character type") {
      navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Generate a password on initial render
  useState(() => {
    generatePassword()
  })

  const calculatePasswordStrength = (password: string) => {
    if (!password || password === "Please select at least one character type")
      return 0

    let strength = 0

    // Length contribution
    if (password.length >= 8) strength += 1
    if (password.length >= 12) strength += 1
    if (password.length >= 16) strength += 1

    // Character variety contribution
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    return Math.min(strength, 5)
  }

  const getStrengthLabel = (strength: number) => {
    const labels = ["Very Weak", "Weak", "Moderate", "Strong", "Very Strong"]
    return labels[Math.min(strength - 1, 4)]
  }

  const getStrengthColor = (strength: number) => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-emerald-500",
    ]
    return colors[Math.min(strength - 1, 4)]
  }

  const passwordStrength = calculatePasswordStrength(password)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Password Generator</h1>
        <p className="text-muted-foreground mt-2">
          Create strong, secure passwords for your accounts
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="truncate text-lg font-medium">
              {password === "Please select at least one character type" ? (
                <span className="text-destructive">{password}</span>
              ) : (
                password || "Generate a password"
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={generatePassword}
                className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full p-2"
                title="Generate New Password"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                onClick={copyToClipboard}
                disabled={
                  !password ||
                  password === "Please select at least one character type"
                }
                className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center rounded-full p-2 disabled:cursor-not-allowed disabled:opacity-50"
                title="Copy to Clipboard"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {password &&
            password !== "Please select at least one character type" && (
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>Strength:</span>
                  <span className="font-medium">
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="flex h-2 gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-full flex-1 rounded ${
                        level <= passwordStrength
                          ? getStrengthColor(level)
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="flex items-center font-medium">
            <Sliders className="mr-2 h-4 w-4" />
            Password Options
          </h2>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="length">
              Length: {length} characters
            </label>
            <input
              id="length"
              type="range"
              min="4"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>4</span>
              <span>32</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label
                className="flex items-center text-sm font-medium"
                htmlFor="uppercase"
              >
                Include Uppercase Letters (A-Z)
              </label>
              <input
                id="uppercase"
                type="checkbox"
                checked={includeUppercase}
                onChange={() => setIncludeUppercase(!includeUppercase)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div className="flex items-center justify-between">
              <label
                className="flex items-center text-sm font-medium"
                htmlFor="lowercase"
              >
                Include Lowercase Letters (a-z)
              </label>
              <input
                id="lowercase"
                type="checkbox"
                checked={includeLowercase}
                onChange={() => setIncludeLowercase(!includeLowercase)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div className="flex items-center justify-between">
              <label
                className="flex items-center text-sm font-medium"
                htmlFor="numbers"
              >
                Include Numbers (0-9)
              </label>
              <input
                id="numbers"
                type="checkbox"
                checked={includeNumbers}
                onChange={() => setIncludeNumbers(!includeNumbers)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>

            <div className="flex items-center justify-between">
              <label
                className="flex items-center text-sm font-medium"
                htmlFor="symbols"
              >
                Include Symbols (!@#$%^&*...)
              </label>
              <input
                id="symbols"
                type="checkbox"
                checked={includeSymbols}
                onChange={() => setIncludeSymbols(!includeSymbols)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t p-4">
          <button
            onClick={generatePassword}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center rounded-md px-4 py-2 text-sm font-medium"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Password
          </button>
        </div>
      </div>
    </div>
  )
}
