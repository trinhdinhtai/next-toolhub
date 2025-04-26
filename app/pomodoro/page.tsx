"use client"

import { useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  Play,
  Settings,
  SkipForward,
  Timer,
  X,
} from "lucide-react"

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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Types
type TimerMode = "work" | "shortBreak" | "longBreak"
type TimerStatus = "idle" | "running" | "paused" | "finished"

// Default settings
const DEFAULT_SETTINGS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundVolume: 50,
  soundEnabled: true,
  notificationsEnabled: true,
}

export default function Pomodoro() {
  // Timer state
  const [mode, setMode] = useState<TimerMode>("work")
  const [status, setStatus] = useState<TimerStatus>("idle")
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.work * 60)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Settings
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [tempSettings, setTempSettings] = useState(DEFAULT_SETTINGS)

  // Session stats
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [totalWorkTime, setTotalWorkTime] = useState(0)

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Timer display formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Set document title
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${
      mode === "work"
        ? "Làm việc"
        : mode === "shortBreak"
          ? "Nghỉ ngắn"
          : "Nghỉ dài"
    } | Pomodoro`

    return () => {
      document.title = "Next Toolhub"
    }
  }, [timeLeft, mode])

  // Timer functions
  const startTimer = () => {
    if (status === "running") return

    setStatus("running")
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleTimerComplete()
          return 0
        }
        return prevTime - 1
      })

      // Update total work time if in work mode
      if (mode === "work") {
        setTotalWorkTime((prev) => prev + 1)
      }
    }, 1000)
  }

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setStatus("paused")
  }

  const resetTimer = (newMode?: TimerMode) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const timerMode = newMode || mode
    const duration = settings[timerMode] * 60

    setTimeLeft(duration)
    setStatus("idle")

    if (newMode) {
      setMode(newMode)
    }
  }

  const handleTimerComplete = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Play sound if enabled
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.volume = settings.soundVolume / 100
      audioRef.current.play()
    }

    // Show notification if enabled
    if (settings.notificationsEnabled) {
      try {
        if (Notification && Notification.permission === "granted") {
          new Notification(
            mode === "work"
              ? "Thời gian làm việc kết thúc!"
              : "Thời gian nghỉ kết thúc!",
            {
              body:
                mode === "work"
                  ? "Giờ là lúc nghỉ ngơi."
                  : "Đã đến lúc quay lại làm việc!",
              icon: "/favicon.ico",
            }
          )
        }
      } catch (e) {
        console.error("Error showing notification:", e)
      }
    }

    setStatus("finished")

    // Update sessions if work session completed
    if (mode === "work") {
      const newSessionsCompleted = sessionsCompleted + 1
      setSessionsCompleted(newSessionsCompleted)

      // Determine next mode
      if (newSessionsCompleted % settings.longBreakInterval === 0) {
        setMode("longBreak")
        setTimeLeft(settings.longBreak * 60)
        if (settings.autoStartBreaks) startTimer()
      } else {
        setMode("shortBreak")
        setTimeLeft(settings.shortBreak * 60)
        if (settings.autoStartBreaks) startTimer()
      }
    } else {
      // If break is finished, start new work session
      setMode("work")
      setTimeLeft(settings.work * 60)
      if (settings.autoStartPomodoros) startTimer()
    }
  }

  // Skip to next session
  const skipSession = () => {
    if (mode === "work") {
      const newSessionsCompleted = sessionsCompleted + 1
      setSessionsCompleted(newSessionsCompleted)

      if (newSessionsCompleted % settings.longBreakInterval === 0) {
        resetTimer("longBreak")
      } else {
        resetTimer("shortBreak")
      }
    } else {
      resetTimer("work")
    }
  }

  // Setup notification permission
  const requestNotificationPermission = async () => {
    if (Notification && Notification.permission !== "granted") {
      try {
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
          setSettings({
            ...settings,
            notificationsEnabled: true,
          })
          setTempSettings({
            ...tempSettings,
            notificationsEnabled: true,
          })
        }
      } catch (e) {
        console.error("Error requesting notification permission:", e)
      }
    }
  }

  // Apply settings changes
  const applySettings = () => {
    setSettings(tempSettings)
    resetTimer()
    setIsSettingsOpen(false)
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalTime =
      mode === "work"
        ? settings.work * 60
        : mode === "shortBreak"
          ? settings.shortBreak * 60
          : settings.longBreak * 60

    return ((totalTime - timeLeft) / totalTime) * 100
  }

  // Calculate time in hours and minutes
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`
    }
    return `${minutes} phút`
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Reset timer when settings change
  useEffect(() => {
    resetTimer()
  }, [settings.work, settings.shortBreak, settings.longBreak])

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Pomodoro Timer</h1>
          <p className="text-muted-foreground text-sm">
            Tập trung làm việc và nghỉ ngơi đúng lúc
          </p>
        </div>

        {/* Timer Card */}
        <Card className="mb-6">
          <CardHeader className="relative pb-4 text-center">
            <div className="absolute top-6 right-6">
              <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTempSettings(settings)}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Cài đặt Pomodoro</SheetTitle>
                    <SheetDescription>
                      Tùy chỉnh thời gian và hành vi của đồng hồ Pomodoro
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Thời gian (phút)</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-muted-foreground text-sm">
                            Làm việc
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={tempSettings.work}
                            onChange={(e) =>
                              setTempSettings({
                                ...tempSettings,
                                work: Math.max(
                                  1,
                                  parseInt(e.target.value) || 1
                                ),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground text-sm">
                            Nghỉ ngắn
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={tempSettings.shortBreak}
                            onChange={(e) =>
                              setTempSettings({
                                ...tempSettings,
                                shortBreak: Math.max(
                                  1,
                                  parseInt(e.target.value) || 1
                                ),
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground text-sm">
                            Nghỉ dài
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={tempSettings.longBreak}
                            onChange={(e) =>
                              setTempSettings({
                                ...tempSettings,
                                longBreak: Math.max(
                                  1,
                                  parseInt(e.target.value) || 1
                                ),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Nghỉ dài sau x chu kỳ
                      </label>
                      <Input
                        type="number"
                        min="1"
                        className="mt-1"
                        value={tempSettings.longBreakInterval}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            longBreakInterval: Math.max(
                              1,
                              parseInt(e.target.value) || 1
                            ),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Hành vi tự động</h3>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoStartBreaks"
                          checked={tempSettings.autoStartBreaks}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              autoStartBreaks: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="autoStartBreaks" className="text-sm">
                          Tự động bắt đầu nghỉ
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoStartPomodoros"
                          checked={tempSettings.autoStartPomodoros}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              autoStartPomodoros: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="autoStartPomodoros" className="text-sm">
                          Tự động bắt đầu pomodoro
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        Âm thanh & Thông báo
                      </h3>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="soundEnabled"
                          checked={tempSettings.soundEnabled}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              soundEnabled: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="soundEnabled" className="text-sm">
                          Bật âm thanh
                        </label>
                      </div>

                      {tempSettings.soundEnabled && (
                        <div>
                          <label className="text-muted-foreground text-sm">
                            Âm lượng: {tempSettings.soundVolume}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={tempSettings.soundVolume}
                            onChange={(e) =>
                              setTempSettings({
                                ...tempSettings,
                                soundVolume: parseInt(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="notificationsEnabled"
                          checked={tempSettings.notificationsEnabled}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              notificationsEnabled: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label
                          htmlFor="notificationsEnabled"
                          className="text-sm"
                        >
                          Bật thông báo
                        </label>
                      </div>

                      {tempSettings.notificationsEnabled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={requestNotificationPermission}
                        >
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Cấp quyền thông báo
                        </Button>
                      )}
                    </div>
                  </div>

                  <SheetFooter>
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        onClick={() => setTempSettings(settings)}
                      >
                        Hủy
                      </Button>
                    </SheetClose>
                    <Button onClick={applySettings}>Lưu thay đổi</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            <Tabs
              value={mode}
              onValueChange={(value) => resetTimer(value as TimerMode)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="work">Làm việc</TabsTrigger>
                <TabsTrigger value="shortBreak">Nghỉ ngắn</TabsTrigger>
                <TabsTrigger value="longBreak">Nghỉ dài</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="pb-6 text-center">
            <div className="relative mb-8">
              <div className="my-8 text-7xl font-bold tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {status === "running" ? (
                <Button
                  size="lg"
                  onClick={pauseTimer}
                  className="w-32"
                  variant="outline"
                >
                  Tạm dừng
                </Button>
              ) : (
                <Button size="lg" onClick={startTimer} className="w-32">
                  {status === "paused" ? "Tiếp tục" : "Bắt đầu"}
                </Button>
              )}

              <Button
                size="icon"
                variant="outline"
                onClick={() => resetTimer()}
              >
                <X className="h-4 w-4" />
              </Button>

              <Button size="icon" variant="outline" onClick={skipSession}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thống kê hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold">{sessionsCompleted}</p>
                <p className="text-muted-foreground text-sm">
                  Chu kỳ đã hoàn thành
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {formatTotalTime(totalWorkTime)}
                </p>
                <p className="text-muted-foreground text-sm">
                  Thời gian tập trung
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audio */}
      <audio ref={audioRef} src="/assets/sounds/bell.mp3" preload="auto" />
    </div>
  )
}
