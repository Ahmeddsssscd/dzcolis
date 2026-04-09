"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { SAMPLE_LISTINGS, type Listing } from "./data";

// ─── Types ───
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wilaya: string;
  avatar: string;
  rating: number;
  reviews: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  transporterId: string;
  status: "pending" | "accepted" | "in_transit" | "delivered" | "cancelled";
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  listingId: string;
  lastMessage?: string;
  updatedAt: string;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

// ─── Auth Context ───
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (data: Omit<User, "id" | "avatar" | "rating" | "reviews" | "createdAt"> & { password: string }) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AppProvider");
  return ctx;
}

// ─── Listings Context ───
interface ListingsContextType {
  listings: Listing[];
  addListing: (listing: Omit<Listing, "id">) => Listing;
  getListingById: (id: string) => Listing | undefined;
}

const ListingsContext = createContext<ListingsContextType | null>(null);

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within AppProvider");
  return ctx;
}

// ─── Bookings Context ───
interface BookingsContextType {
  bookings: Booking[];
  createBooking: (listingId: string, transporterId: string) => Booking;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
  getBookingsForUser: (userId: string) => Booking[];
}

const BookingsContext = createContext<BookingsContextType | null>(null);

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used within AppProvider");
  return ctx;
}

// ─── Messages Context ───
interface MessagesContextType {
  conversations: Conversation[];
  messages: Message[];
  sendMessage: (conversationId: string, text: string) => void;
  getOrCreateConversation: (otherUserId: string, listingId: string) => Conversation;
  getMessages: (conversationId: string) => Message[];
}

const MessagesContext = createContext<MessagesContextType | null>(null);

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within AppProvider");
  return ctx;
}

// ─── Toast Context ───
interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within AppProvider");
  return ctx;
}

// ─── Helpers ───
function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Provider ───
export function AppProvider({ children }: { children: ReactNode }) {
  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    setUser(loadFromStorage<User | null>("dzcolis_user", null));
    setAuthLoaded(true);
  }, []);

  const login = (email: string, _password: string): boolean => {
    const users = loadFromStorage<(User & { password: string })[]>("dzcolis_users", []);
    const found = users.find((u) => u.email === email);
    if (found) {
      const { password: _, ...userData } = found;
      void _;
      setUser(userData);
      saveToStorage("dzcolis_user", userData);
      return true;
    }
    return false;
  };

  const register = (data: Omit<User, "id" | "avatar" | "rating" | "reviews" | "createdAt"> & { password: string }): boolean => {
    const users = loadFromStorage<(User & { password: string })[]>("dzcolis_users", []);
    if (users.some((u) => u.email === data.email)) return false;

    const newUser = {
      ...data,
      id: generateId(),
      avatar: data.firstName[0] + data.lastName[0],
      rating: 5.0,
      reviews: 0,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveToStorage("dzcolis_users", users);

    const { password: _, ...userData } = newUser;
    void _;
    setUser(userData);
    saveToStorage("dzcolis_user", userData);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dzcolis_user");
  };

  // Listings
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const stored = loadFromStorage<Listing[]>("dzcolis_listings", []);
    if (stored.length === 0) {
      setListings(SAMPLE_LISTINGS);
      saveToStorage("dzcolis_listings", SAMPLE_LISTINGS);
    } else {
      setListings(stored);
    }
  }, []);

  const addListing = (listing: Omit<Listing, "id">): Listing => {
    const newListing = { ...listing, id: generateId() };
    const updated = [newListing, ...listings];
    setListings(updated);
    saveToStorage("dzcolis_listings", updated);
    return newListing;
  };

  const getListingById = (id: string) => listings.find((l) => l.id === id);

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setBookings(loadFromStorage<Booking[]>("dzcolis_bookings", []));
  }, []);

  const createBooking = (listingId: string, transporterId: string): Booking => {
    const booking: Booking = {
      id: generateId(),
      listingId,
      userId: user?.id || "",
      transporterId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const updated = [booking, ...bookings];
    setBookings(updated);
    saveToStorage("dzcolis_bookings", updated);
    return booking;
  };

  const updateBookingStatus = (bookingId: string, status: Booking["status"]) => {
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
    setBookings(updated);
    saveToStorage("dzcolis_bookings", updated);
  };

  const getBookingsForUser = (userId: string) =>
    bookings.filter((b) => b.userId === userId || b.transporterId === userId);

  // Messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setConversations(loadFromStorage<Conversation[]>("dzcolis_conversations", []));
    setMessages(loadFromStorage<Message[]>("dzcolis_messages", []));
  }, []);

  const getOrCreateConversation = (otherUserId: string, listingId: string): Conversation => {
    const existing = conversations.find(
      (c) => c.participants.includes(otherUserId) && c.listingId === listingId
    );
    if (existing) return existing;

    const conv: Conversation = {
      id: generateId(),
      participants: [user?.id || "", otherUserId],
      listingId,
      updatedAt: new Date().toISOString(),
    };
    const updated = [conv, ...conversations];
    setConversations(updated);
    saveToStorage("dzcolis_conversations", updated);
    return conv;
  };

  const sendMessage = (conversationId: string, text: string) => {
    const msg: Message = {
      id: generateId(),
      conversationId,
      senderId: user?.id || "",
      text,
      createdAt: new Date().toISOString(),
    };
    const updatedMessages = [...messages, msg];
    setMessages(updatedMessages);
    saveToStorage("dzcolis_messages", updatedMessages);

    const updatedConvs = conversations.map((c) =>
      c.id === conversationId ? { ...c, lastMessage: text, updatedAt: msg.createdAt } : c
    );
    setConversations(updatedConvs);
    saveToStorage("dzcolis_conversations", updatedConvs);
  };

  const getMessages = (conversationId: string) =>
    messages.filter((m) => m.conversationId === conversationId);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const toast: Toast = { id: generateId(), message, type };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => removeToast(toast.id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (!authLoaded) return null;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      <ListingsContext.Provider value={{ listings, addListing, getListingById }}>
        <BookingsContext.Provider value={{ bookings, createBooking, updateBookingStatus, getBookingsForUser }}>
          <MessagesContext.Provider value={{ conversations, messages, sendMessage, getOrCreateConversation, getMessages }}>
            <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
              {children}
            </ToastContext.Provider>
          </MessagesContext.Provider>
        </BookingsContext.Provider>
      </ListingsContext.Provider>
    </AuthContext.Provider>
  );
}
