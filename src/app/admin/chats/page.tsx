'use client'

import { useState, useEffect, useRef } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Button from '@/components/ui/Button'
import { Send, Search, Paperclip, MoreVertical, User, Phone, CheckCheck, Loader2 } from 'lucide-react'

// Types
type Chat = {
    id: number
    chatId: string
    firstName: string | null
    lastName: string | null
    username: string | null
    updatedAt: string
    lead: { id: number; name: string; status: string } | null
    messages: { text: string | null; createdAt: string }[]
}

type Message = {
    id: number
    text: string | null
    isFromBot: boolean
    createdAt: string
    isRead: boolean
}

export default function ChatsPage() {
    const [chats, setChats] = useState<Chat[]>([])
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load Chats
    useEffect(() => {
        fetchChats()
        const interval = setInterval(fetchChats, 10000) // Poll every 10s
        return () => clearInterval(interval)
    }, [])

    // Load Messages when chat selected
    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id)
            const interval = setInterval(() => fetchMessages(selectedChat.id), 5000)
            return () => clearInterval(interval)
        }
    }, [selectedChat])

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchChats = async () => {
        try {
            const res = await fetch('/api/telegram/chats')
            if (res.ok) setChats(await res.json())
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (id: number) => {
        const res = await fetch(`/api/telegram/chats/${id}/messages`)
        if (res.ok) setMessages(await res.json())
    }

    const handleSend = async () => {
        if (!input.trim() || !selectedChat) return

        setSending(true)
        try {
            const res = await fetch('/api/telegram/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: selectedChat.chatId, // External Telegram ID
                    dbChatId: selectedChat.id, // Internal DB ID
                    text: input
                })
            })

            if (res.ok) {
                setInput('')
                fetchMessages(selectedChat.id)
                fetchChats() // Update last message preview
            }
        } finally {
            setSending(false)
        }
    }

    const getInitials = (chat: Chat) => {
        const f = chat.firstName?.[0] || '?'
        const l = chat.lastName?.[0] || ''
        return (f + l).toUpperCase()
    }

    return (
        <div className="min-h-screen bg-[var(--background)] flex">
            <AdminSidebar />
            <div className="flex-1 flex flex-col ml-64">
                <AdminHeader title="Сообщения" />

                <div className="flex-1 flex overflow-hidden h-[calc(100vh-64px)]">

                    {/* Left: Chat List */}
                    <div className="w-80 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col">
                        <div className="p-4 border-b border-[var(--border)]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Поиск..."
                                    className="w-full pl-9 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-[var(--text-muted)]">Загрузка...</div>
                            ) : chats.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-[var(--surface-hover)] transition-colors border-b border-[var(--border)] ${selectedChat?.id === chat.id ? 'bg-[var(--primary)]/5' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium shrink-0">
                                        {getInitials(chat)}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-medium text-[var(--text)] truncate">
                                                {chat.firstName} {chat.lastName}
                                            </span>
                                            <span className="text-xs text-[var(--text-muted)] shrink-0">
                                                {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--text-muted)] truncate">
                                            {chat.messages[0]?.text || 'Нет сообщений'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Chat Window */}
                    {selectedChat ? (
                        <div className="flex-1 flex flex-col bg-[#e5ddd5] dark:bg-[#0b141a]">
                            {/* Header */}
                            <div className="p-3 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                                        {getInitials(selectedChat)}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-[var(--text)]">
                                            {selectedChat.firstName} {selectedChat.lastName}
                                        </h3>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {selectedChat.username ? `@${selectedChat.username}` : 'Telegram User'}
                                            {selectedChat.lead && (
                                                <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                    {selectedChat.lead.status}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm"><Phone size={20} /></Button>
                                    <Button variant="ghost" size="sm"><MoreVertical size={20} /></Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-repeat" style={{ backgroundImage: "url('/img/bg-chat.png')" }}>
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`max-w-[70%] rounded-lg p-2 shadow-sm relative group ${msg.isFromBot
                                                ? 'bg-[#dcf8c6] dark:bg-[#005c4b] ml-auto rounded-tr-none'
                                                : 'bg-white dark:bg-[#202c33] mr-auto rounded-tl-none'
                                            }`}
                                    >
                                        <p className="text-sm text-gray-800 dark:text-gray-100 pr-6 pb-2 break-words">
                                            {msg.text}
                                        </p>
                                        <div className="absolute bottom-1 right-2 flex items-center gap-1">
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {msg.isFromBot && (
                                                <CheckCheck size={14} className={msg.isRead ? "text-blue-500" : "text-gray-400"} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-3 bg-[var(--surface)] border-t border-[var(--border)] flex items-end gap-2">
                                <Button variant="ghost" size="icon" className="text-[var(--text-muted)]">
                                    <Paperclip size={20} />
                                </Button>
                                <div className="flex-1 bg-[var(--background)] rounded-lg border border-[var(--border)] px-4 py-2">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSend()
                                            }
                                        }}
                                        placeholder="Введите сообщение..."
                                        className="w-full bg-transparent border-none focus:outline-none resize-none max-h-32 text-sm"
                                        rows={1}
                                    />
                                </div>
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || sending}
                                    className="h-10 w-10 p-0 rounded-full flex items-center justify-center bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                                >
                                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </Button>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-[var(--surface)] border-l border-[var(--border)] text-[var(--text-muted)]">
                            <div className="w-24 h-24 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mb-4">
                                <Send size={40} className="ml-1" />
                            </div>
                            <h2 className="text-xl font-medium text-[var(--text)] mb-2">Выберите чат</h2>
                            <p>Чтобы начать общение, выберите диалог из списка слева</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
