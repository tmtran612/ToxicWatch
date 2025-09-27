import { BrainIcon, UserIcon } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex space-x-2 max-w-[80%] ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser ? "bg-primary" : "bg-chart-2/20"
          }`}
        >
          {isUser ? (
            <UserIcon className="h-4 w-4 text-primary-foreground" />
          ) : (
            <BrainIcon className="h-4 w-4 text-chart-2" />
          )}
        </div>
        <div
          className={`rounded-lg p-3 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground"}`}
        >
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          <div className={`text-xs mt-1 opacity-70 ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </div>
  )
}
