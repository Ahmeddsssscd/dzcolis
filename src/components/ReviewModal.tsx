"use client";
import { useState } from "react";

interface ReviewModalProps {
  transporterName: string;
  transporterAvatar: string;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
}

export default function ReviewModal({ transporterName, transporterAvatar, onSubmit, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const LABELS = ["", "Mauvais", "Moyen", "Bien", "Très bien", "Excellent !"];

  function handleSubmit() {
    if (rating === 0) return;
    setSubmitted(true);
    setTimeout(() => { onSubmit(rating, comment); onClose(); }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="font-bold text-dz-gray-800 text-lg">Merci pour votre avis !</p>
            <p className="text-dz-gray-500 text-sm mt-1">Votre avis aide la communauté DZColis.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-dz-gray-800">Évaluer le transporteur</h2>
              <button onClick={onClose} className="text-dz-gray-400 hover:text-dz-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Transporter */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-dz-gray-50 rounded-xl">
              <div className="w-11 h-11 bg-dz-green/10 rounded-full flex items-center justify-center font-bold text-dz-green text-sm flex-shrink-0">
                {transporterAvatar}
              </div>
              <div>
                <p className="font-semibold text-dz-gray-800 text-sm">{transporterName}</p>
                <p className="text-xs text-dz-gray-400">Votre transporteur</p>
              </div>
            </div>

            {/* Stars */}
            <div className="mb-2 text-center">
              <p className="text-xs font-semibold text-dz-gray-500 uppercase tracking-wide mb-3">Votre note</p>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i}
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110 active:scale-95">
                    <svg className={`w-10 h-10 transition-colors ${i <= (hover || rating) ? "text-yellow-400 fill-yellow-400" : "text-dz-gray-200 fill-dz-gray-200"}`} viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </button>
                ))}
              </div>
              {(hover || rating) > 0 && (
                <p className="text-sm font-semibold text-dz-gray-600 h-5">{LABELS[hover || rating]}</p>
              )}
              {!(hover || rating) && <p className="h-5"/>}
            </div>

            {/* Comment */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-dz-gray-500 uppercase tracking-wide mb-2">
                Commentaire <span className="font-normal normal-case text-dz-gray-400">(optionnel)</span>
              </label>
              <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Livraison rapide, colis en parfait état, très professionnel..."
                className="w-full px-4 py-3 border border-dz-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green resize-none"/>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 border border-dz-gray-200 text-dz-gray-600 py-3 rounded-xl font-medium hover:bg-dz-gray-50 transition-colors text-sm">
                Annuler
              </button>
              <button onClick={handleSubmit} disabled={rating === 0}
                className="flex-[2] bg-dz-green hover:opacity-90 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-all text-sm">
                Publier mon avis
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
