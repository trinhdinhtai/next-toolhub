import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-8 flex items-center text-sm"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to tools
        </Link>
        {children}
      </div>
    </div>
  )
}
