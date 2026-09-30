import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Briefcase,
  BookOpen
} from 'lucide-react';

export const AIChat = () => {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      agent_used: 'Coordinator Agent',
      content: `Hello ${user?.full_name || 'Student'}! I am your Coordinator Agent. How can I assist you with your academic schedule or placement preparation today?`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    "What should I study today?",
    "DBMS assignment due tomorrow, estimated 2 hours.",
    "Move my DSA session.",
    "Create my weekly study schedule.",
    "How should I prepare for software developer placements?"
  ];

  const handleSendMessage = async (textToSend = null) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || loading) return;

    // Add user message
    const userMsg = { role: 'user', content: message };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message });
      const agentMsg = {
        role: 'agent',
        agent_used: res.data.agent_used || 'Coordinator Agent',
        action_taken: res.data.action_taken,
        content: res.data.response,
        data: res.data.data
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'agent',
        agent_used: 'Coordinator Agent',
        content: 'Apologies, I encountered an issue processing your request. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel rounded-3xl border border-slate-800 overflow-hidden">
      
      {/* Top Header */}
      <div className="h-16 px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <span>Coordinator Agent Chat</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                LangGraph Active
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Orchestrates Study & Task Agent and Placement Agent
            </p>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : msg.agent_used === 'Placement Agent'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-indigo-400 border border-slate-700'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Body */}
            <div className={`max-w-xl rounded-2xl p-4 space-y-2 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
            }`}>
              {msg.role === 'agent' && (
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-800 text-xs text-indigo-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{msg.agent_used}</span>
                </div>
              )}

              <p className="whitespace-pre-line">{msg.content}</p>

              {/* Dynamic Replan Visual Indicator in Chat */}
              {msg.data?.schedule_updated && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Dynamic Replanning Executed!</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Schedule saved to PostgreSQL. Check the AI Planner tab for updated visual diff badges.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-slate-400 text-xs animate-pulse p-2">
            <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Coordinator Agent analyzing intent...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 overflow-x-auto whitespace-nowrap flex space-x-2 shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors shrink-0"
          >
            "{qp}"
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="p-4 border-t border-slate-800 bg-slate-950 flex items-center space-x-3 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask Coordinator Agent (e.g. DBMS assignment due tomorrow, 2 hrs)..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
