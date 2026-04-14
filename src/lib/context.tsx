"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database, Profile, Listing, Booking, Notification } from "@/lib/supabase/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// ─── Module-level singleton — created ONCE, never recreated ───────────
const supabase = createClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ─── Re-export Listing so pages that import from context still work ───
export type { Listing, Booking, Profile };

// ─── Types ────────────────────────────────────────────────────────────
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
  referralCode: string;
  referredBy?: string;
  kycStatus: Profile["kyc_status"];
  role: Profile["role"];
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

// ─── Helpers ──────────────────────────────────────────────────────────
function profileToUser(profile: Profile, email: string): User {
  return {
    id: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    email,
    phone: profile.phone,
    wilaya: profile.wilaya,
    avatar: (profile.first_name[0] ?? "?") + (profile.last_name[0] ?? ""),
    rating: profile.rating,
    reviews: profile.review_count,
    createdAt: profile.created_at,
    referralCode: profile.referral_code ?? "",
    referredBy: profile.referred_by ?? undefined,
    kycStatus: profile.kyc_status,
    role: profile.role,
  };
}

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// ─── Auth Context ─────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (data: {
    firstName: string; lastName: string; email: string;
    password: string; phone: string; wilaya: string; referredBy?: string;
  }) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<Pick<User, "firstName" | "lastName" | "phone" | "wilaya">>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AppProvider");
  return ctx;
}

// ─── Listings Context ─────────────────────────────────────────────────
interface ListingsContextType {
  listings: Listing[];
  listingsLoading: boolean;
  addListing: (listing: Omit<Listing, "id" | "created_at" | "status">) => Promise<Listing | null>;
  getListingById: (id: string) => Listing | undefined;
  refreshListings: () => Promise<void>;
}

const ListingsContext = createContext<ListingsContextType | null>(null);

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within AppProvider");
  return ctx;
}

// ─── Bookings Context ─────────────────────────────────────────────────
interface BookingsContextType {
  bookings: Booking[];
  bookingsLoading: boolean;
  createBooking: (data: {
    listing_id: string;
    weight: number;
    dimensions?: string;
    content: string;
    pickup_address: string;
    recipient_name: string;
    recipient_phone: string;
    instructions?: string;
    total_amount: number;
  }) => Promise<Booking | null>;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => Promise<void>;
  getBookingsForUser: (userId: string) => Booking[];
  refreshBookings: () => Promise<void>;
}

const BookingsContext = createContext<BookingsContextType | null>(null);

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used within AppProvider");
  return ctx;
}

// ─── Messages Context (local for now, replace with Supabase Realtime later) ──
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

// ─── Notifications Context ────────────────────────────────────────────
interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within AppProvider");
  return ctx;
}

// ─── Toast Context ────────────────────────────────────────────────────
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

// ─── Provider ─────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {

  // ── Auth ──
  const [user, setUser]               = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchProfile = useCallback(async (sbUser: SupabaseUser) => {
    const { data } = await db
      .from("profiles")
      .select("*")
      .eq("id", sbUser.id)
      .single();
    if (data) setUser(profileToUser(data, sbUser.email ?? ""));
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) await fetchProfile(sbUser);
  }, [fetchProfile]);

  useEffect(() => {
    // Safety timeout — never stay stuck loading
    const timeout = setTimeout(() => setAuthLoading(false), 2000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchProfile(session.user); // fire-and-forget — never block the auth callback
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT") {
        clearTimeout(timeout);
        setAuthLoading(false);
      }
    });

    return () => { clearTimeout(timeout); subscription.unsubscribe(); };
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const register = async (data: {
    firstName: string; lastName: string; email: string;
    password: string; phone: string; wilaya: string; referredBy?: string;
  }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          wilaya: data.wilaya,
          referred_by: data.referredBy ?? null,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  const updateUser = async (data: Partial<Pick<User, "firstName" | "lastName" | "phone" | "wilaya">>) => {
    if (!user) return;
    const updates: Record<string, string> = {};
    if (data.firstName) updates.first_name = data.firstName;
    if (data.lastName)  updates.last_name  = data.lastName;
    if (data.phone)     updates.phone      = data.phone;
    if (data.wilaya)    updates.wilaya     = data.wilaya;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("profiles").update(updates).eq("id", user.id);
    await refreshUser();
  };

  // ── Listings ──
  const [listings, setListings]           = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setListingsLoading(true);
    const { data } = await db
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    setListings(data ?? []);
    setListingsLoading(false);
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const addListing = async (listing: Omit<Listing, "id" | "created_at" | "status">) => {
    const { data, error } = await db
      .from("listings")
      .insert({ ...listing, status: "active" })
      .select()
      .single();
    if (error || !data) return null;
    await fetchListings();
    return data;
  };

  const getListingById = (id: string) => listings.find((l) => l.id === id);

  // ── Bookings ──
  const [bookings, setBookings]           = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!user) { setBookings([]); setBookingsLoading(false); return; }
    setBookingsLoading(true);
    const { data } = await db
      .from("bookings")
      .select("*")
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false });
    setBookings(data ?? []);
    setBookingsLoading(false);
  }, [user]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const createBooking = async (data: {
    listing_id: string; weight: number; dimensions?: string;
    content: string; pickup_address: string; recipient_name: string;
    recipient_phone: string; instructions?: string; total_amount: number;
  }) => {
    if (!user) return null;
    const { data: booking, error } = await db
      .from("bookings")
      .insert({
        ...data,
        sender_id: user.id,
        status: "pending",
        payment_status: "unpaid",
        booking_ref: "", // will be set by DB trigger
      })
      .select()
      .single();
    if (error || !booking) return null;

    // Notify listing owner of the new booking
    const { data: listing } = await db.from("listings").select("user_id, from_city, to_city").eq("id", data.listing_id).single();
    if (listing) {
      await db.from("notifications").insert({
        user_id: listing.user_id,
        type: "new_booking",
        title: "Nouvelle réservation ! 📦",
        message: `Vous avez une nouvelle demande sur votre trajet ${listing.from_city} → ${listing.to_city}.`,
        read: false,
        data: { booking_id: booking.id, booking_ref: booking.booking_ref },
      });
    }

    await fetchBookings();
    return booking;
  };

  const updateBookingStatus = async (bookingId: string, status: Booking["status"]) => {
    await db.from("bookings").update({ status }).eq("id", bookingId);
    await fetchBookings();
  };

  const getBookingsForUser = (userId: string) =>
    bookings.filter((b) => b.sender_id === userId);

  // ── Messages (local — replace with Supabase Realtime in future sprint) ──
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages]           = useState<Message[]>([]);

  const getOrCreateConversation = (otherUserId: string, listingId: string): Conversation => {
    const existing = conversations.find(
      (c) => c.participants.includes(otherUserId) && c.listingId === listingId
    );
    if (existing) return existing;
    const conv: Conversation = {
      id: generateId(),
      participants: [user?.id ?? "", otherUserId],
      listingId,
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [conv, ...prev]);
    return conv;
  };

  const sendMessage = (conversationId: string, text: string) => {
    const msg: Message = {
      id: generateId(),
      conversationId,
      senderId: user?.id ?? "",
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setConversations((prev) =>
      prev.map((c) => c.id === conversationId ? { ...c, lastMessage: text, updatedAt: msg.createdAt } : c)
    );
  };

  const getMessages = (conversationId: string) =>
    messages.filter((m) => m.conversationId === conversationId);

  // ── Notifications ──
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications(data ?? []);
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await db.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Toasts ──
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const toast: Toast = { id: generateId(), message, type };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => removeToast(toast.id), 4000);
  };

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-dz-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, supabaseUser, authLoading, login, register, logout, updateUser, refreshUser }}>
      <ListingsContext.Provider value={{ listings, listingsLoading, addListing, getListingById, refreshListings: fetchListings }}>
        <BookingsContext.Provider value={{ bookings, bookingsLoading, createBooking, updateBookingStatus, getBookingsForUser, refreshBookings: fetchBookings }}>
          <MessagesContext.Provider value={{ conversations, messages, sendMessage, getOrCreateConversation, getMessages }}>
            <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, refreshNotifications: fetchNotifications }}>
              <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
                {children}
              </ToastContext.Provider>
            </NotificationsContext.Provider>
          </MessagesContext.Provider>
        </BookingsContext.Provider>
      </ListingsContext.Provider>
    </AuthContext.Provider>
  );
}
