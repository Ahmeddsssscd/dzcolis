"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ConvItem {
  id: string;
  listing_id: string;
  sender_id: string;
  transporter_id: string;
  last_message: string | null;
  last_message_at: string | null;
  other_name: string;
  other_id: string;
  route: string;
}

interface MsgItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

// Module-level singleton (safe — same pattern as context.tsx)
const supabase = createClient();

export default function MessagesPage() {
  const { user, authLoading } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<ConvItem[]>([]);
  const [messages, setMessages] = useState<MsgItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Fetch conversations ──────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.status === 404 || res.status === 500) { setDbError(true); return; }
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data);
    } catch {
      setDbError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/connexion"); return; }
    fetchConversations();
  }, [user, authLoading, router, fetchConversations]);

  // ── Fetch messages for selected conversation ──────────────────────────────
  const fetchMessages = useCallback(async (convId: string) => {
    const res = await fetch(`/api/messages?conversation_id=${convId}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    }
  }, []);

  useEffect(() => {
    if (!selectedConvId) return;
    fetchMessages(selectedConvId);
  }, [selectedConvId, fetchMessages]);

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedConvId || !user) return;

    // Unsubscribe from previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`messages:${selectedConvId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConvId}`,
        },
        (payload) => {
          const msg = payload.new as MsgItem;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Update last_message in conversation list
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConvId
                ? { ...c, last_message: msg.text, last_message_at: msg.created_at }
                : c
            )
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvId, user]);

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId || sending) return;
    const text = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic insert
    const optimistic: MsgItem = {
      id: `opt-${Date.now()}`,
      conversation_id: selectedConvId,
      sender_id: user?.id ?? "",
      text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: selectedConvId, text }),
      });
      // Real message will arrive via Realtime; optimistic will be deduped
    } catch {
      // Remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  // ── Empty / error states ──────────────────────────────────────────────────
  if (authLoading || !user) return (
    <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-dz-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (loading) {
    return (
      <div className="bg-dz-gray-50 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-dz-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-dz-gray-800 mb-6">Messages</h1>

        {dbError ? (
          /* ── DB tables not yet created ── */
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-amber-800 mb-2">Configuration requise</h3>
            <p className="text-sm text-amber-700 mb-4">
              Les tables de messagerie n&apos;existent pas encore. Exécutez le SQL ci-dessous dans Supabase Dashboard → SQL Editor.
            </p>
            <pre className="bg-white border border-amber-200 rounded-xl p-4 text-left text-xs text-gray-700 overflow-auto whitespace-pre-wrap max-w-2xl mx-auto">
{`-- Run in Supabase Dashboard → SQL Editor
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  transporter_id uuid references profiles(id) on delete cascade,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz default now(),
  unique(listing_id, sender_id, transporter_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

alter table conversations enable row level security;
alter table messages enable row level security;

create policy "Users see own conversations" on conversations
  for all using (auth.uid() = sender_id or auth.uid() = transporter_id);

create policy "Users see messages in their convs" on messages
  for all using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
      and (c.sender_id = auth.uid() or c.transporter_id = auth.uid())
    )
  );

alter publication supabase_realtime add table messages;`}
            </pre>
          </div>
        ) : conversations.length === 0 ? (
          /* ── No conversations yet ── */
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-dz-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-dz-gray-700 mb-2">Aucun message</h3>
            <p className="text-sm text-dz-gray-500">Contactez un transporteur depuis une annonce pour démarrer une conversation</p>
          </div>
        ) : (
          /* ── Chat UI ── */
          <div className="bg-white rounded-2xl border border-dz-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-3" style={{ minHeight: "520px" }}>

            {/* Conversation list */}
            <div className="border-r border-dz-gray-200 flex flex-col">
              <div className="p-4 border-b border-dz-gray-200">
                <h2 className="font-semibold text-dz-gray-800 text-sm">Conversations ({conversations.length})</h2>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-dz-gray-100">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left p-4 hover:bg-dz-gray-50 transition-colors ${selectedConvId === conv.id ? "bg-dz-green/5 border-l-2 border-dz-green" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {conv.other_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-dz-gray-800 text-sm truncate">{conv.other_name}</p>
                        <p className="text-xs text-dz-green/80 font-medium truncate">{conv.route}</p>
                        {conv.last_message && (
                          <p className="text-xs text-dz-gray-400 truncate mt-0.5">{conv.last_message}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat area */}
            <div className="md:col-span-2 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-dz-gray-200 flex items-center gap-3">
                    <div className="w-9 h-9 bg-dz-green/10 text-dz-green rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {selectedConv.other_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-dz-gray-800 text-sm">{selectedConv.other_name}</p>
                      <p className="text-xs text-dz-gray-500">{selectedConv.route}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "380px" }}>
                    {messages.length === 0 && (
                      <p className="text-center text-sm text-dz-gray-400 py-10">Début de la conversation. Dites bonjour ! 👋</p>
                    )}
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-dz-green text-white rounded-br-md" : "bg-dz-gray-100 text-dz-gray-800 rounded-bl-md"}`}>
                            <p>{msg.text}</p>
                            <div className={`text-[10px] mt-1 ${isMe ? "text-green-100" : "text-dz-gray-400"}`}>
                              {new Date(msg.created_at).toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-dz-gray-200 flex gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="Écrire un message..."
                      className="flex-1 px-4 py-2.5 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-sm"
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                      className="bg-dz-green hover:bg-dz-green-light disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm flex items-center gap-2"
                    >
                      {sending ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                      Envoyer
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-dz-gray-400 gap-3">
                  <svg className="w-12 h-12 text-dz-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">Sélectionnez une conversation</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
