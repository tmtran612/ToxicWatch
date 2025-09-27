"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickQuestionsProps {
  onQuestionSelect: (question: string) => void
}

export function QuickQuestions({ onQuestionSelect }: QuickQuestionsProps) {
  const questions = [
    "What are the health effects of benzene?",
    "Which chemicals cause cancer?",
    "What does lead exposure do to children?",
    "How dangerous is vinyl chloride?",
    "What facilities near Richmond, VA release the most toxic chemicals?",
    "Compare toxic releases in Virginia to national averages",
    "What actions can communities take about toxic releases?",
    "Explain chromium health risks in simple terms",
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm">Quick Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {questions.map((question, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="w-full text-left justify-start h-auto p-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onQuestionSelect(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
