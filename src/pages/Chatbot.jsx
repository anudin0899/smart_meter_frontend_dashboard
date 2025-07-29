import { useState } from "react"
import { Send, Bot, User, Sparkles } from "lucide-react"

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI assistant. I can help you analyze your data, generate reports, and answer questions about your business metrics. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const predefinedQuestions = [
    "What are our top performing products?",
    "Show me sales trends for this quarter",
    "Which regions need attention?",
    "Generate a summary report",
    "What's our customer retention rate?",
  ]

  const handleSendMessage = async (message) => {
    if (!message.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: "bot",
        content: generateBotResponse(message),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateBotResponse = (userMessage) => {
    const responses = {
      "top performing products":
        "Based on your sales data, your top performing products are:\n\n1. **Product A** - $45,000 revenue (8.2x turnover)\n2. **Product D** - $35,000 revenue (9.1x turnover)\n3. **Product B** - $28,000 revenue (12.5x turnover)\n\nThese products show strong performance with high turnover rates and consistent sales.",
      "sales trends":
        "Your sales trends show:\n\n📈 **Positive Growth**: 18% average growth over the last 6 months\n📊 **Peak Performance**: June with $67,000 revenue\n🎯 **Target Achievement**: 103.2% of targets met\n\nRecommendation: Focus on replicating June's success factors in upcoming months.",
      regions:
        "Regional performance analysis:\n\n🌏 **Asia Pacific**: Leading with $520,000 sales (18.7% growth)\n🇺🇸 **North America**: Stable at $450,000 (12.5% growth)\n🇪🇺 **Europe**: $380,000 (8.3% growth - needs attention)\n\nSuggestion: Implement Asia Pacific's successful strategies in Europe.",
      "summary report":
        "## Business Summary Report\n\n**Financial Health**: ✅ Strong\n- Revenue: $3.28M (YTD)\n- Profit Margin: 28.4%\n- Growth Rate: 15.3%\n\n**Key Metrics**:\n- Customer Satisfaction: 4.2/5\n- Inventory Turnover: 10.2x\n- Operational Efficiency: 87%\n\n**Action Items**:\n1. Optimize European operations\n2. Increase inventory for high-turnover products\n3. Focus on customer retention programs",
      "retention rate":
        "Customer retention analysis:\n\n📊 **Overall Retention**: 70%\n\n**By Segment**:\n- Premium: 92% (excellent)\n- Standard: 78% (good)\n- Basic: 65% (needs improvement)\n- New: 45% (expected)\n\n**Recommendations**:\n- Implement loyalty program for Basic segment\n- Enhance onboarding for new customers",
    }

    const lowerMessage = userMessage.toLowerCase()
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response
      }
    }

    return "I understand you're asking about your business data. While I can provide insights on sales trends, customer behavior, regional performance, and financial metrics, I'd need more specific information to give you the most accurate analysis. Could you please rephrase your question or choose from one of the suggested topics?"
  }

  const handleQuestionClick = (question) => {
    handleSendMessage(question)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Sparkles className="h-4 w-4" />
          <span>Powered by AI</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col card">
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === "bot" ? "bg-primary-100 dark:bg-primary-900" : "bg-gray-100 dark:bg-dark-700"
                }`}
              >
                {message.type === "bot" ? (
                  <Bot className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                ) : (
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div
                className={`flex-1 max-w-xs lg:max-w-md xl:max-w-lg ${
                  message.type === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.type === "bot"
                      ? "bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white"
                      : "bg-primary-600 text-white"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="bg-gray-100 dark:bg-dark-700 rounded-lg p-3">
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
          )}
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick questions to get started:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-6 border-t border-gray-200 dark:border-dark-700">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputMessage)}
              placeholder="Ask me anything about your business data..."
              className="flex-1 input-field"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot
