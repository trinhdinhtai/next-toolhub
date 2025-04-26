import Link from "next/link"
import { ArrowRight, Code, FileType, Image, Key, Terminal } from "lucide-react"

const tools = [
  {
    title: "Image Compression",
    description: "Compress and optimize images without losing quality",
    icon: <Image className="h-6 w-6" />,
    link: "/tools/image-compression",
  },
  {
    title: "File Converter",
    description: "Convert files between different formats",
    icon: <FileType className="h-6 w-6" />,
    link: "/tools/file-converter",
  },
  {
    title: "Password Generator",
    description: "Create strong and secure passwords",
    icon: <Key className="h-6 w-6" />,
    link: "/tools/password-generator",
  },
  {
    title: "JSON Formatter",
    description: "Format, validate and beautify JSON data",
    icon: <Code className="h-6 w-6" />,
    link: "/tools/json-formatter",
  },
  {
    title: "RegEx Checker",
    description: "Test and debug regular expressions",
    icon: <Terminal className="h-6 w-6" />,
    link: "/tools/regex-checker",
  },
]

export default function Home() {
  return (
    <div className="container">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">ToolHub</h1>
          <p className="text-muted-foreground mt-4 text-xl">
            A collection of useful tools for everyday tasks
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link
              href={tool.link}
              key={tool.title}
              className="group flex flex-col space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    {tool.icon}
                  </div>
                  <h2 className="text-xl font-medium">{tool.title}</h2>
                </div>
                <ArrowRight className="text-primary h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="text-muted-foreground">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
