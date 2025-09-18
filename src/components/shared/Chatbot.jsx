import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, MessageSquare, Send, User, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', content: 'Hello! How can I help you with Work Suite Pro today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);
  const { toast } = useToast();

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage = { sender: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chatbot-handler', {
        body: JSON.stringify({ query: userMessage.content }),
      });

      if (error) throw error;

      const botMessage = { sender: 'bot', content: data.reply || "Sorry, I couldn't understand that." };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error calling chatbot function:', error);
      toast({
        title: 'Chatbot Error',
        description: error.message || 'Could not get a response from the chatbot.',
        variant: 'destructive',
      });
      setMessages(prev => [...prev, { sender: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fabVariants = {
    closed: { scale: 0, opacity: 0, y: 50 },
    open: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  };

  const chatWindowVariants = {
    closed: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
    open: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        variants={fabVariants}
        initial="closed"
        animate="open"
        onClick={toggleChat}
      >
        <Button
          size="icon"
          className="rounded-full h-14 w-14 bg-sky-500 hover:bg-sky-600 shadow-lg"
          aria-label="Toggle Chatbot"
        >
          {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[350px] h-[500px]"
            variants={chatWindowVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <Card className="h-full flex flex-col bg-slate-800/90 backdrop-blur-md border-slate-700 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center">
                  <Bot className="h-6 w-6 mr-2 text-sky-400" />
                  <CardTitle className="text-lg text-slate-100">Work Suite Assistant</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleChat} className="text-slate-400 hover:text-slate-100">
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-grow p-0 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-2.5 max-w-[80%]`}>
                        {msg.sender === 'bot' && <Bot className="h-6 w-6 text-sky-400 flex-shrink-0 mt-1" />}
                        <div
                          className={`p-3 rounded-lg ${
                            msg.sender === 'user'
                              ? 'bg-sky-600 text-white rounded-br-none'
                              : 'bg-slate-700 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        {msg.sender === 'user' && <User className="h-6 w-6 text-slate-300 flex-shrink-0 mt-1" />}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mb-3">
                       <div className="flex items-start gap-2.5">
                        <Bot className="h-6 w-6 text-sky-400 flex-shrink-0 mt-1" />
                        <div className="p-3 rounded-lg bg-slate-700 text-slate-200 rounded-bl-none">
                            <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
                        </div>
                       </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <div className="p-4 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Ask something..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    className="bg-slate-700 border-slate-600 placeholder:text-slate-400 focus:ring-sky-500 focus:border-sky-500"
                    disabled={isLoading}
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || inputValue.trim() === ''} className="bg-sky-500 hover:bg-sky-600">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;