import {
  Code,
  FileType,
  Home,
  Image,
  Key,
  Settings,
  Terminal,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Grouped menu items
const itemGroups = [
  {
    label: "Ảnh và video",
    items: [
      {
        title: "Chuyển đổi định dạng",
        url: "/image-converter",
        icon: Image,
      },
    ],
  },
  {
    label: "Công cụ tập tin",
    items: [
      {
        title: "File Converter",
        url: "/tools/file-converter",
        icon: FileType,
      },
    ],
  },
  {
    label: "Bảo mật",
    items: [
      {
        title: "Password Generator",
        url: "/tools/password-generator",
        icon: Key,
      },
    ],
  },
  {
    label: "Công cụ cho lập trình viên",
    items: [
      {
        title: "JSON Formatter",
        url: "/tools/json-formatter",
        icon: Code,
      },
      {
        title: "RegEx Checker",
        url: "/tools/regex-checker",
        icon: Terminal,
      },
    ],
  },
]

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        {itemGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
