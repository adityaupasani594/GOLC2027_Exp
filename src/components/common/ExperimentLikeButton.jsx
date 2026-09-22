import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { likeService, normalizeExpKey } from '../../services/likeService';

export default function ExperimentLikeButton({
  expId,
  variant = 'card', // 'card' | 'compact' | 'modal' | 'navbar'
  showCount = true,
  className = ''
}) {
  const { user } = useAuth();
  const key = normalizeExpKey(expId);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Initialize state
  useEffect(() => {
    const uid = user?.uid || user?.id || null;
    const initial = likeService.getInitialLikesState(uid);
    setIsLiked(initial.userLiked.has(key));
    setLikeCount(initial.counts[key] || 0);

    // Fetch freshest state from Firestore / local cache
    likeService.getAllLikes(uid).then(({ counts, userLiked }) => {
      setIsLiked(userLiked.has(key));
      if (typeof counts[key] === 'number') {
        setLikeCount(counts[key]);
      }
    });

    // Listen to global like broadcast so all instances update synchronously
    const handleUpdate = (e) => {
      if (e.detail && e.detail.expKey === key) {
        setLikeCount(e.detail.count);
        if (e.detail.uid === (user?.uid || user?.id || 'guest')) {
          setIsLiked(e.detail.isLiked);
        }
      }
    };

    window.addEventListener('ir-lab-likes-updated', handleUpdate);
    return () => window.removeEventListener('ir-lab-likes-updated', handleUpdate);
  }, [key, user]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    try {
      const result = await likeService.toggleLike(expId, user);
      setIsLiked(result.isLiked);
      setLikeCount(result.count);
    } catch (err) {
      console.warn('Error toggling like:', err);
    }
  };

  // Styles per variant
  if (variant === 'compact' || variant === 'navbar') {
    return (
      <motion.button
        type="button"
        onClick={handleToggle}
        whileTap={{ scale: 0.85 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
          isLiked
            ? 'bg-rose-50 text-rose-600 border border-rose-200/90 shadow-xs'
            : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500 border border-slate-200/80'
        } ${className}`}
        title={isLiked ? 'Unlike this experiment' : 'Like this experiment'}
      >
        <motion.div
          animate={isLiked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400 group-hover:text-rose-500'
            }`}
          />
        </motion.div>
        {showCount && (
          <span className="text-[11px] font-mono font-medium">
            {likeCount}
          </span>
        )}
      </motion.button>
    );
  }

  if (variant === 'modal') {
    return (
      <motion.button
        type="button"
        onClick={handleToggle}
        whileTap={{ scale: 0.88 }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
          isLiked
            ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40 shadow-sm'
            : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
        } ${className}`}
        title={isLiked ? 'Unlike this experiment' : 'Like this experiment'}
      >
        <Heart
          className={`w-4 h-4 transition-transform ${
            isLiked ? 'fill-rose-400 text-rose-400 scale-110' : 'text-white/80'
          }`}
        />
        {showCount && (
          <span className="text-xs font-medium">
            {isLiked ? 'Liked' : 'Like'} ({likeCount})
          </span>
        )}
      </motion.button>
    );
  }

  // Default 'card' variant
  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      whileTap={{ scale: 0.85 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer select-none ${
        isLiked
          ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
          : 'bg-slate-50 hover:bg-rose-50/50 text-slate-500 hover:text-rose-600 border border-slate-200/70 hover:border-rose-200'
      } ${className}`}
      title={isLiked ? 'Unlike this experiment' : 'Like this experiment'}
    >
      <motion.div
        animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: isHovered ? 1.15 : 1 }}
        transition={{ duration: 0.25 }}
      >
        <Heart
          className={`w-3.5 h-3.5 transition-colors ${
            isLiked
              ? 'fill-rose-500 text-rose-500 drop-shadow-xs'
              : 'text-slate-400 group-hover:text-rose-500'
          }`}
        />
      </motion.div>
      {showCount && (
        <span className="text-[11px] font-mono font-semibold">
          {likeCount}
        </span>
      )}
    </motion.button>
  );
}
