"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useMessages, useListings } from "@/lib/context";

export default function MessagesPage() {
  const { user } = useAuth();
  const { conversations, getMessages, sendMessage } = useMessages();
  const { getListingById } = useListings();
  const router = useRouter();
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  if (!user) {
    router.push("/connexion");
    return null;
  }

  const myConversations = conversations.filter((c) => c.participants.includes(user.id) || c.participants.includes(user.avatar));
  const activeConv = myConversations.find((c) => c.id === selectedConv);
  const activeMessages = selectedConv ? getMessages(selectedConv) : [];

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConv) return;
    sendMessage(selectedConv, newMessage);
    setNewMessage("");
  };

  return (
    <div className="bg-dz-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-dz-gray-800 mb-6">Messages</h1>

        {myConversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dz-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-dz-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-dz-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-dz-gray-700 mb-2">Aucun message</h3>
            <p className="text-sm text-dz-gray-500">Contactez un transporteur ou expéditeur depuis une annonce</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dz-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-3" style={{ minHeight: "500px" }}>
            {/* Conversation list */}
            <div className="border-r border-dz-gray-200">
              <div className="p-4 border-b border-dz-gray-200">
                <h2 className="font-semibold text-dz-gray-800 text-sm">Conversations ({myConversations.length})</h2>
              </div>
              <div className="divide-y divide-dz-gray-100">
                {myConversations.map((conv) => {
                  const listing = getListingById(conv.listingId);
                  const otherUser = conv.participants.find((p) => p !== user.id && p !== user.avatar) || "?";
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv.id)}
                      className={`w-full text-left p-4 hover:bg-dz-gray-50 transition-colors ${selectedConv === conv.id ? "bg-dz-green/5 border-l-2 border-dz-green" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dz-green/10 text-dz-green rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {otherUser.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-dz-gray-800 text-sm truncate">{listing?.title || "Conversation"}</p>
                          <p className="text-xs text-dz-gray-500 truncate">{conv.lastMessage || "Nouveau message"}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat area */}
            <div className="md:col-span-2 flex flex-col">
              {activeConv ? (
                <>
                  <div className="p-4 border-b border-dz-gray-200">
                    <p className="font-semibold text-dz-gray-800 text-sm">
                      {getListingById(activeConv.listingId)?.title || "Conversation"}
                    </p>
                  </div>
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "400px" }}>
                    {activeMessages.length === 0 && (
                      <p className="text-center text-sm text-dz-gray-400 py-8">Début de la conversation</p>
                    )}
                    {activeMessages.map((msg) => {
                      const isMe = msg.senderId === user.id || msg.senderId === user.avatar;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-dz-green text-white rounded-br-md" : "bg-dz-gray-100 text-dz-gray-800 rounded-bl-md"}`}>
                            {msg.text}
                            <div className={`text-[10px] mt-1 ${isMe ? "text-green-200" : "text-dz-gray-400"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t border-dz-gray-200 flex gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Écrire un message..."
                      className="flex-1 px-4 py-2.5 border border-dz-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green text-sm"
                    />
                    <button onClick={handleSend} className="bg-dz-green hover:bg-dz-green-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm">
                      Envoyer
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-dz-gray-400 text-sm">
                  Sélectionnez une conversation
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
