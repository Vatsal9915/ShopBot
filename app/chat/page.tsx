"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  RotateCcw,
  ShoppingCart,
  User,
  Bot,
  LogOut,
  Clock,
  Trash2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadChatHistory();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      if (!data.authenticated) {
        router.push("/login");
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem("shopbot-chat-history");
      if (saved) {
        const history = JSON.parse(saved);
        setChatHistory(
          history.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const saveChatToHistory = (currentMessages: ChatMessage[]) => {
    try {
      const updatedHistory = [...chatHistory, ...currentMessages.slice(-2)];
      setChatHistory(updatedHistory);
      localStorage.setItem(
        "shopbot-chat-history",
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Sending message to API:", userMessage.content);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Received response:", responseText);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveChatToHistory(finalMessages);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having technical difficulties. Please try again.",
        timestamp: new Date(),
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const resetConversation = () => {
    setMessages([]);
  };

  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem("shopbot-chat-history");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-semibold">ShopBot</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          {user && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
          )}
        </div>

        {/* Chat Controls */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetConversation}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Conversation
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Chat History
          </h3>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {chatHistory.slice(-20).map((msg, index) => (
                <div
                  key={`${msg.id}-${index}`}
                  className="text-xs p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      variant={msg.role === "user" ? "default" : "secondary"}
                    >
                      {msg.role === "user" ? "You" : "Bot"}
                    </Badge>
                    <span className="text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700 line-clamp-2">{msg.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            AI Shopping Assistant
          </h2>
          <p className="text-sm text-gray-600">
            Ask me about products, get recommendations, or search our inventory
          </p>
        </div>

        {/* Messages - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Welcome to ShopBot! 👋
                  </h3>
                  <p className="text-blue-700 mb-4">
                    I'm your AI shopping assistant. I can help you:
                  </p>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>
                      Search for products by name, category, or description
                    </li>
                    <li>Get personalized product recommendations</li>
                    <li>Compare products and find the best deals</li>
                    <li>Answer questions about our inventory</li>
                  </ul>
                  <p className="text-blue-700 mt-4">
                    Try asking: "Show me laptops under $1000" or "I need a gift
                    for a tech enthusiast"
                  </p>
                </CardContent>
              </Card>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div
                      className={`flex-shrink-0 ${
                        message.role === "user"
                          ? "text-blue-100"
                          : "text-gray-400"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-gray-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form - Fixed at bottom */}
        <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 left-0 right-0 z-10 shadow-md">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex space-x-2">
              <Input
                id="chat-input"
                name="message"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me about products, get recommendations..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
