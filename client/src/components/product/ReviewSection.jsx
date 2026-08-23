import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquare, Plus, X, Reply, CornerDownRight, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const ReviewSection = ({ productId, reviews = [], averageRating = 4.8, totalReviews = 0, onReviewSubmitted }) => {
  const { isAuthenticated, user, isSeller } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews);

  // Seller reply inline state
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Calculate score breakdown
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  localReviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  const handleHelpful = async (reviewId) => {
    try {
      await api.upvoteReview(reviewId);
      setLocalReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r));
      showInfo('Thank you for your feedback!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPhoto = () => {
    if (!photoUrl.trim().startsWith('http')) {
      showError('Please enter a valid image URL starting with http:// or https://');
      return;
    }
    setPhotos(prev => [...prev, photoUrl.trim()]);
    setPhotoUrl('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      showError('Please select a star rating and enter your review comment.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitReview(productId, { rating, title, comment, images: photos });
      if (res.success) {
        showSuccess('Your review has been submitted and posted!');
        setLocalReviews(prev => [res.review, ...prev]);
        setShowModal(false);
        setTitle('');
        setComment('');
        setPhotos([]);
        if (onReviewSubmitted) onReviewSubmitted(res);
      }
    } catch (err) {
      showError(err.message || 'Could not post review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostSellerReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const res = await api.replyToReview(reviewId, replyText.trim());
      if (res.success) {
        showSuccess('Seller response posted publicly!');
        setLocalReviews(prev => prev.map(r => r.id === reviewId ? res.review : r));
        setReplyingReviewId(null);
        setReplyText('');
      }
    } catch (err) {
      showError(err.message || 'Failed to post reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
      
      {/* Header & Score Summary */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        
        {/* Left Rating score badge */}
        <div className="flex items-center gap-6">
          <div className="text-center p-4 bg-amber-50/60 rounded-3xl border border-amber-200/80 min-w-[130px]">
            <div className="text-4xl font-black text-slate-900">{averageRating?.toFixed(1) || '4.8'}</div>
            <div className="flex justify-center text-amber-400 my-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
              ))}
            </div>
            <div className="text-xs text-slate-500 font-semibold">{totalReviews || localReviews.length} Ratings</div>
          </div>

          {/* Rating percentage bars */}
          <div className="space-y-1.5 min-w-[200px] text-xs">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = ratingCounts[stars] || 0;
              const percent = localReviews.length > 0 ? (count / localReviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-slate-600">
                  <span className="font-bold w-3">{stars}★</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-400 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review CTA */}
        <div>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                showInfo('Please log in to leave a verified review.');
                return;
              }
              setShowModal(true);
            }}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Customer Review</span>
          </button>
        </div>
      </div>

      {/* Reviews Stream */}
      <div className="space-y-4">
        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          Customer Feedback ({localReviews.length})
        </h4>

        {localReviews.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs bg-slate-50 rounded-2xl">
            No customer reviews yet. Be the first to share your experience with this item!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 space-y-4">
            {localReviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.userName || 'Shopper')}`}
                      alt={rev.userName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="font-bold text-xs text-slate-800">{rev.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                {/* Review Photos */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rev.images.map((img, i) => (
                      <img key={i} src={img} alt="Review attachment" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                    ))}
                  </div>
                )}

                {/* Seller Reply Box */}
                {rev.sellerReply && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border-l-4 border-indigo-600 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                      <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Response from {rev.sellerStoreName || 'Merchant Store'}:</span>
                    </div>
                    <p className="text-xs text-slate-600 pl-5">{rev.sellerReply}</p>
                    <div className="text-[10px] text-slate-400 pl-5">{new Date(rev.sellerReplyAt || rev.createdAt).toLocaleDateString()}</div>
                  </div>
                )}

                {/* Seller Reply CTA (for sellers) */}
                {isSeller && !rev.sellerReply && (
                  <div className="pt-1">
                    {replyingReviewId === rev.id ? (
                      <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-200">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write official merchant response..."
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyingReviewId(null)}
                            className="px-3 py-1 text-xs text-slate-600 font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePostSellerReply(rev.id)}
                            disabled={isSubmittingReply || !replyText.trim()}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                          >
                            {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setReplyingReviewId(rev.id); setReplyText(''); }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Reply className="w-3 h-3" />
                        <span>Reply to Customer as Seller</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Helpful count */}
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <button
                    onClick={() => handleHelpful(rev.id)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({rev.helpfulVotes || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">Write Your Product Review</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star rating selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Your Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200 fill-slate-200'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} out of 5 Stars</span>
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Review Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Exceptional sound and durable build quality"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Detailed Feedback</label>
                <textarea
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike about this product? How is the performance and quality?"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-normal leading-relaxed"
                />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Add Photo Proof (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Paste image URL of your product..."
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {photos.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {photos.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p} alt="Upload" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                        <button
                          type="button"
                          onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
