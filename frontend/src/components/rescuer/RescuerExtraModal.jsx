import { motion } from 'framer-motion';

export default function RescuerExtraModal({
  show,
  onClose,
  extraNote,
  setExtraNote,
  onLogExtra,
  logging,
}) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="glass w-full max-w-sm rounded-3xl p-6 border border-white/10"
      >
        <h3 className="font-display font-bold text-xl text-white mb-1">Log an Extra</h3>
        <p className="text-slate-400 text-sm mb-4">
          It's okay. We'll adjust. Let's try to make your next gap 30 minutes longer.
        </p>
        <textarea
          value={extraNote}
          onChange={(e) => setExtraNote(e.target.value)}
          placeholder="Optional: what triggered it? (helps us learn)"
          rows={3}
          className="input resize-none mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-outline flex-1 justify-center"
          >
            Cancel
          </button>
          <button
            onClick={onLogExtra}
            disabled={logging}
            className="btn-primary flex-1 justify-center"
          >
            {logging ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Log It 💚'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
