
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Recipient, Message, AppConfig } from './types';
import { sendTelegramMessage } from './services/telegramService';

// --- UI Components ---

const Sidebar = ({ onOpenSettings, activeTab }: { onOpenSettings: () => void, activeTab: string }) => (
  <div className="w-20 bg-[#242F3D] flex flex-col items-center py-6 space-y-8 flex-shrink-0 z-20">
    <div className="text-white text-2xl mb-4">
      <i className="fab fa-telegram"></i>
    </div>
    <button className={`flex flex-col items-center transition-colors ${activeTab === 'chats' ? 'text-[#3390EC]' : 'text-gray-400 hover:text-white'}`}>
      <i className="fas fa-comment-dots text-2xl"></i>
      <span className="text-[10px] mt-1 font-bold">Chats</span>
    </button>
    <button className="flex flex-col items-center text-gray-400 hover:text-white transition-colors">
      <i className="fas fa-users text-2xl"></i>
      <span className="text-[10px] mt-1 font-bold">Contacts</span>
    </button>
    <div className="flex-1"></div>
    <button onClick={onOpenSettings} className="flex flex-col items-center text-gray-400 hover:text-white transition-colors">
      <i className="fas fa-cog text-2xl"></i>
      <span className="text-[10px] mt-1 font-bold">Settings</span>
    </button>
  </div>
);

const ContactList = ({ 
  recipients, 
  activeId, 
  onSelect, 
  searchTerm, 
  onSearchChange,
  onOpenAddModal
}: { 
  recipients: Recipient[], 
  activeId: string | null, 
  onSelect: (id: string) => void,
  searchTerm: string,
  onSearchChange: (val: string) => void,
  onOpenAddModal: () => void
}) => (
  <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-10">
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Messages</h1>
        <button 
          onClick={onOpenAddModal}
          className="w-8 h-8 rounded-full bg-[#3390EC]/10 text-[#3390EC] flex items-center justify-center hover:bg-[#3390EC]/20 transition-colors"
        >
          <i className="fas fa-plus text-sm"></i>
        </button>
      </div>
      <div className="relative">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search contacts..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3390EC]/20 text-sm transition-all"
        />
      </div>
    </div>
    <div className="overflow-y-auto flex-1 custom-scrollbar">
      {recipients.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 opacity-40 text-center px-4">
          <i className="fas fa-user-friends text-3xl mb-2"></i>
          <p className="text-xs">No contacts found</p>
        </div>
      ) : (
        recipients.map((r) => (
          <div 
            key={r.id} 
            onClick={() => onSelect(r.id)}
            className={`flex items-center p-3 cursor-pointer transition-colors relative group ${activeId === r.id ? 'bg-[#3390EC] text-white' : 'hover:bg-gray-50'}`}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0 border-2 border-transparent group-hover:border-white/50">
              <img src={r.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name)}&backgroundColor=3390EC,242F3D,87A47A`} alt={r.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className={`font-semibold truncate text-sm ${activeId === r.id ? 'text-white' : 'text-gray-900'}`}>
                  {r.name}
                </h3>
                <span className={`text-[10px] ${activeId === r.id ? 'text-blue-100' : 'text-gray-400'}`}>
                  {r.lastTime || 'No data'}
                </span>
              </div>
              <p className={`text-xs truncate ${activeId === r.id ? 'text-blue-50' : 'text-gray-500'}`}>
                {r.lastMessage || 'ID: ' + r.id}
              </p>
            </div>
            {activeId === r.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>}
          </div>
        ))
      )}
    </div>
  </div>
);

const ChatPanel = ({ 
  recipient, 
  messages, 
  onSendMessage,
  botConfigured
}: { 
  recipient: Recipient | null, 
  messages: Message[], 
  onSendMessage: (text: string) => void,
  botConfigured: boolean
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  if (!recipient) {
    return (
      <div className="flex-1 bg-[#F4F4F5] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-paper-plane text-4xl text-gray-400"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Select a chat to start messaging</h2>
        <p className="text-sm text-gray-500 max-w-xs">Connect your bot and add chat IDs to start sending messages through your Telegram bot.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative h-full bg-[#E7EBF0] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] z-0"></div>

      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
            <img src={recipient.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(recipient.name)}`} alt="" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-gray-800 text-sm">{recipient.name}</span>
            <span className="text-[11px] text-green-500 font-medium">online</span>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-gray-400">
          {!botConfigured && <span className="text-[10px] bg-red-100 text-red-500 px-2 py-1 rounded font-bold">BOT TOKEN NEEDED</span>}
          <i className="fas fa-search cursor-pointer hover:text-gray-600 transition-colors"></i>
          <i className="fas fa-ellipsis-v cursor-pointer hover:text-gray-600 transition-colors"></i>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 z-10 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex justify-center mt-12">
            <div className="bg-black/10 text-white text-[11px] px-4 py-1 rounded-full backdrop-blur-sm">
              Send a message to start conversation
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-[14px] shadow-sm relative group animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                m.sender === 'me' ? 'bg-[#EEFFDE] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'
              }`}>
                {m.text}
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <span className="text-[10px] text-gray-400 leading-none">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                  {m.sender === 'me' && <i className="fas fa-check-double text-[10px] text-blue-400"></i>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white z-20 flex items-center space-x-3 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <button className="text-gray-400 hover:text-[#3390EC] transition-colors p-2">
          <i className="fas fa-paperclip text-xl"></i>
        </button>
        <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-1">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write a message..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 outline-none"
          />
          <button className="text-gray-400 hover:text-yellow-500 transition-colors">
            <i className="far fa-smile text-xl"></i>
          </button>
        </div>
        {inputText.trim() ? (
          <button 
            onClick={handleSend}
            className="w-12 h-12 bg-[#3390EC] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-[#2b7bc9] active:scale-95 transition-all"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        ) : (
          <button className="text-gray-400 hover:text-[#3390EC] transition-colors p-2">
            <i className="fas fa-microphone text-xl"></i>
          </button>
        )}
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#242F3D] text-white">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('tg_messenger_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse config:', e);
    }
    return {
      botToken: '',
      recipients: [
        { id: '12345678', name: 'Saved Messages', lastMessage: 'Cloud storage for you', lastTime: '00:00' },
      ]
    };
  });

  const [activeId, setActiveId] = useState<string | null>(config.recipients[0]?.id || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newContactName, setNewContactName] = useState('');
  const [newContactId, setNewContactId] = useState('');
  const [tempToken, setTempToken] = useState(config.botToken);

  useEffect(() => {
    localStorage.setItem('tg_messenger_v2', JSON.stringify(config));
  }, [config]);

  const filteredRecipients = useMemo(() => {
    return config.recipients.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.id.includes(searchTerm)
    );
  }, [config.recipients, searchTerm]);

  const activeRecipient = useMemo(() => 
    config.recipients.find(r => r.id === activeId) || null,
  [config.recipients, activeId]);

  const handleSendMessage = async (text: string) => {
    if (!activeId || !config.botToken) {
      alert('⚠️ Bot Token is missing or Recipient not selected.');
      if (!config.botToken) setShowSettings(true);
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: activeId,
      text,
      sender: 'me',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      await sendTelegramMessage(config.botToken, activeId, text);
      setConfig(prev => ({
        ...prev,
        recipients: prev.recipients.map(r => r.id === activeId ? {
          ...r,
          lastMessage: text,
          lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        } : r)
      }));
    } catch (error: any) {
      alert(`❌ Telegram Error: ${error.message}`);
    }
  };

  const handleAddContact = () => {
    if (newContactName && newContactId) {
      const exists = config.recipients.some(r => r.id === newContactId);
      if (exists) {
        alert('Chat ID already exists in your contacts.');
        return;
      }

      const newR: Recipient = {
        id: newContactId,
        name: newContactName,
        lastMessage: 'Added newly',
        lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      };

      setConfig(prev => ({ ...prev, recipients: [newR, ...prev.recipients] }));
      setNewContactName('');
      setNewContactId('');
      setShowAddContact(false);
      setActiveId(newContactId);
    }
  };

  const handleSaveSettings = () => {
    setConfig(prev => ({ ...prev, botToken: tempToken }));
    setShowSettings(false);
  };

  return (
    <div className="flex h-screen w-full select-none overflow-hidden font-sans">
      <Sidebar onOpenSettings={() => setShowSettings(true)} activeTab="chats" />
      
      <ContactList 
        recipients={filteredRecipients} 
        activeId={activeId} 
        onSelect={setActiveId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenAddModal={() => setShowAddContact(true)}
      />
      
      <ChatPanel 
        recipient={activeRecipient} 
        messages={messages.filter(m => m.chatId === activeId)} 
        onSendMessage={handleSendMessage}
        botConfigured={!!config.botToken}
      />

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Bot Settings">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Telegram Bot Token</label>
            <div className="relative">
              <i className="fas fa-key absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"></i>
              <input 
                type="password" 
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                placeholder="000000000:ABCDefgh..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#3390EC] outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Contacts</label>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {config.recipients.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name)}&size=32`} className="rounded-full" alt="" />
                    <span className="text-xs font-bold">{r.name}</span>
                  </div>
                  <button 
                    onClick={() => setConfig(prev => ({ ...prev, recipients: prev.recipients.filter(x => x.id !== r.id) }))}
                    className="text-red-300 hover:text-red-500"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleSaveSettings} className="w-full bg-[#3390EC] text-white py-3 rounded-xl font-bold hover:bg-[#2b7bc9] transition-all">
            Save Configuration
          </button>
        </div>
      </Modal>

      <Modal isOpen={showAddContact} onClose={() => setShowAddContact(false)} title="Add New Contact">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Contact Name</label>
            <input 
              type="text" 
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#3390EC] outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Telegram Chat ID</label>
            <input 
              type="text" 
              value={newContactId}
              onChange={(e) => setNewContactId(e.target.value.replace(/[^0-9-]/g, ''))}
              placeholder="e.g. 12345678"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#3390EC] outline-none"
            />
          </div>
          <button onClick={handleAddContact} disabled={!newContactName || !newContactId} className="w-full bg-[#3390EC] text-white py-3 rounded-xl font-bold disabled:bg-gray-200 transition-all">
            Add Contact
          </button>
        </div>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </div>
  );
}
