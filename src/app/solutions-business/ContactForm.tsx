'use client';

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    volume: "",
    message: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-dz-green/10 border border-dz-green/30 rounded-2xl p-10 text-center">
        <div className="w-16 h-16 bg-dz-green rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-dz-gray-800 mb-2">Demande envoyée avec succès !</h3>
        <p className="text-dz-gray-500">
          Notre équipe commerciale vous contactera dans les 24 heures ouvrables pour étudier vos besoins.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-dz-gray-300 mb-1.5">
            Nom complet <span className="text-dz-green">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Votre nom"
            className="w-full bg-white/10 border border-white/20 text-white placeholder-dz-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dz-green/60 focus:bg-white/15 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dz-gray-300 mb-1.5">
            Entreprise <span className="text-dz-green">*</span>
          </label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            placeholder="Nom de votre entreprise"
            className="w-full bg-white/10 border border-white/20 text-white placeholder-dz-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dz-green/60 focus:bg-white/15 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-dz-gray-300 mb-1.5">
            Email professionnel <span className="text-dz-green">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="email@entreprise.com"
            className="w-full bg-white/10 border border-white/20 text-white placeholder-dz-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dz-green/60 focus:bg-white/15 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dz-gray-300 mb-1.5">
            Volume mensuel estimé
          </label>
          <select
            name="volume"
            value={form.volume}
            onChange={handleChange}
            className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dz-green/60 focus:bg-white/15 transition-colors appearance-none cursor-pointer"
          >
            <option value="" className="bg-dz-gray-800">Sélectionner...</option>
            <option value="moins-20" className="bg-dz-gray-800">Moins de 20 envois</option>
            <option value="20-100" className="bg-dz-gray-800">20 – 100 envois</option>
            <option value="100-500" className="bg-dz-gray-800">100 – 500 envois</option>
            <option value="500-plus" className="bg-dz-gray-800">Plus de 500 envois</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dz-gray-300 mb-1.5">
          Message <span className="text-dz-green">*</span>
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Décrivez vos besoins logistiques, vos destinations habituelles, vos contraintes particulières..."
          className="w-full bg-white/10 border border-white/20 text-white placeholder-dz-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-dz-green/60 focus:bg-white/15 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-dz-green hover:bg-dz-green-dark text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
      >
        Envoyer ma demande
      </button>
    </form>
  );
}
