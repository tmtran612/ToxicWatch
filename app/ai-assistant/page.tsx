"use client"

import type React from "react"

import { useState } from "react"
import { BrainIcon, SendIcon, FactoryIcon, AlertTriangleIcon, MessageCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatMessage } from "@/components/chat-message"
import { QuickQuestions } from "@/components/quick-questions"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI Health Assistant. I can help you understand the health impacts of toxic chemicals released by EPA TRI facilities. Ask me questions like 'What are the health effects of benzene?' or 'Which chemicals in my area are most dangerous?'",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim(), history: messages }),
      })

      const result = await response.json()

      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        console.error("AI response error:", result.error)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FactoryIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">ToxicWatch</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </a>
              <a href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                Search
              </a>
              <a href="/map" className="text-muted-foreground hover:text-foreground transition-colors">
                Map
              </a>
              <a href="/ai-assistant" className="text-foreground font-medium">
                AI Assistant
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <BrainIcon className="h-6 w-6 text-chart-2" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">AI Health Assistant</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get plain-language explanations of chemical health impacts and personalized insights about toxic releases
              in your community.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="bg-card border-border h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircleIcon className="h-5 w-5 text-primary" />
                    <span>Health Impact Chat</span>
                  </CardTitle>
                  <CardDescription>
                    Ask questions about chemical health effects, facility risks, and community comparisons
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-muted/50 rounded-lg p-3 max-w-xs">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t border-border p-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Ask about chemical health effects, facility risks, or community comparisons..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                        disabled={loading}
                      />
                      <Button onClick={handleSend} disabled={loading || !input.trim()}>
                        <SendIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Questions */}
              <QuickQuestions onQuestionSelect={handleQuickQuestion} />

              {/* Health Alert */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <AlertTriangleIcon className="h-4 w-4 text-accent" />
                    <span>Health Notice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    This AI assistant provides educational information about chemical health effects. For medical
                    concerns, consult healthcare professionals.
                  </p>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm">What I Can Help With</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>• Chemical health effects</li>
                    <li>• Risk level explanations</li>
                    <li>• Community comparisons</li>
                    <li>• Facility impact analysis</li>
                    <li>• Action recommendations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
