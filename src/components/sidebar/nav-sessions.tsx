"use client"

import { MessageSquare, Plus } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export interface ChatSession {
  id: string
  title: string
  timestamp: string
  isActive?: boolean
}

export function NavSessions({
  sessions,
  onNewChat,
  onSelectSession,
}: {
  sessions: ChatSession[]
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chat Sessions</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onNewChat}>
            <Plus className="size-4" />
            <span>New Chat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {sessions.map((session) => (
          <SidebarMenuItem key={session.id}>
            <SidebarMenuButton 
              onClick={() => onSelectSession(session.id)}
              data-active={session.isActive}
            >
              <MessageSquare className="size-4" />
              <div className="flex flex-1 flex-col">
                <span className="truncate">{session.title}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {session.timestamp}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
} 