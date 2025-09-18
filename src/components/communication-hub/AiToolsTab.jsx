import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Mic, Smile, Send, Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

const FeaturePlaceholderCard = ({ title, description, icon: Icon, phase, category, className = "" }) => (
  <Card className={`bg-card-alt-themed/80 backdrop-blur-sm shadow-lg hover:shadow-teal-500/20 transition-shadow duration-300 flex flex-col ${className}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <Icon className="h-7 w-7 text-teal-400" />
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </div>
      {category && <p className="text-xs text-teal-500 mt-1">{category}</p>}
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between">
      <CardDescription className="text-muted-foreground mb-3 text-sm">{description}</CardDescription>
      {phase && (
        <div className="text-xs text-teal-300/80 font-medium bg-teal-700/30 px-2 py-1 rounded-full inline-block self-start mt-auto">
          {phase}
        </div>
      )}
    </CardContent>
  </Card>
);

const SimpleChatbotInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chatbot-handler', {
        body: { user_message: input, history: messages }, // Pass history for context
      });

      if (error) throw error;

      const botMessage = { sender: 'bot', text: data.bot_response || "I'm not sure how to respond to that." };
      setMessages(prev => [...prev, botMessage]);

    } catch (err) {
      console.error("Error calling chatbot handler:", err);
      toast({ title: "Chatbot Error", description: err.message || "Could not get a response from the chatbot.", variant: "destructive" });
      setMessages(prev => [...prev, {sender: 'bot', text: "Sorry, I encountered an error."}]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-card-themed w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center"><Bot className="mr-2 h-6 w-6 text-primary" /> AI Assistant</CardTitle>
        <CardDescription>Chat with our AI assistant. Powered by Supabase Edge Functions.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full border border-border rounded-md p-3 mb-3">
          {messages.map((msg, index) => (
            <div key={index} className={`flex mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2 rounded-lg max-w-[70%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {msg.sender === 'bot' && <Bot className="inline h-4 w-4 mr-1 mb-0.5 text-primary"/>}
                {msg.sender === 'user' && <User className="inline h-4 w-4 mr-1 mb-0.5"/>}
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && <div className="flex justify-start"><div className="p-2 rounded-lg bg-muted"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div></div>}
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI something..."
            className="flex-grow ui-textarea"
            rows={1}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e);}}}
          />
          <Button type="submit" className="ui-button-primary" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">This is a basic AI chat interface. More advanced features coming soon!</p>
      </CardFooter>
    </Card>
  );
};


const AiToolsTab = () => {
  const aiCommunicationFeatures = [
    { title: "NLP Chatbots (Advanced)", description: "AI-powered assistants to answer queries, suggest actions, and automate responses within team chat.", icon: Bot, category: "AI Collaboration", phase: "Future Enhancement" },
    { title: "Voice Commands & AI Search", description: "Search knowledge bases or execute commands via voice input, assisted by AI.", icon: Mic, category: "AI Collaboration", phase: "Future Enhancement" },
    { title: "Sentiment Analysis for Feedback", description: "AI analyzes user feedback from forums and chats to improve platform usability and gauge team morale.", icon: Smile, category: "AI Analytics", phase: "Future Enhancement" },
    { title: "Automated Meeting Summaries", description: "Upload meeting transcripts or connect to recording services to get AI-generated summaries and action items.", icon: Bot, category: "AI Productivity", phase: "Future Enhancement" },
    { title: "Smart Content Suggestions", description: "AI suggests relevant knowledge base articles or documents during chat conversations or content creation.", icon: Bot, category: "AI Knowledge Management", phase: "Future Enhancement" },
  ];

  return (
    <div className="space-y-6">
      <SimpleChatbotInterface />
      <Card className="bg-card-themed">
        <CardHeader>
          <CardTitle>Future AI Communication Enhancements</CardTitle>
          <CardDescription>Explore upcoming AI-powered tools to revolutionize collaboration and productivity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiCommunicationFeatures.map(feature => (
              <FeaturePlaceholderCard 
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                phase={feature.phase}
                category={feature.category}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiToolsTab;