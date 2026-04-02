"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: userMsg.content }),
      });
      const data = await res.json();

      if (data.output) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.output,
          },
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Something went wrong. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-6 z-50 w-[380px] h-[500px] flex flex-col shadow-2xl border-border/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Apex Strategy Bot</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4" role="log">
              <div className="space-y-3 py-2">
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ask anything about Apex Strategy
                  </p>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-amber-900/40 text-amber-50"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  aria-label="Type a message"
                  className="min-h-[40px] max-h-[100px] resize-none text-sm"
                  rows={1}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="shrink-0 bg-amber-700 hover:bg-amber-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating trigger button */}
      <Button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg bg-amber-700 hover:bg-amber-600"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </Button>
    </>
  );
}
