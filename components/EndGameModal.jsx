import React, { useState } from "react";

export default function EndGameModal({ isOpen, onClose, gameState, secretWord, onPlayAgain, stats, guesses }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isWin = gameState === "won";

  const handleShare = async () => {
    const attemptCount = isWin ? guesses.length : "X";
    const header = `WordTwist ${attemptCount}/6\n\n`;
    
    const grid = guesses
      .map((row) =>
        row
          .map((tile) => {
            if (tile.status === "correct") return "🟩";
            if (tile.status === "present") return "🟨";
            return "⬛";
          })
          .join("")
      )
      .join("\n");

    const shareText = header + grid;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className={`text-3xl font-extrabold mb-2 ${isWin ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {isWin ? "Case Closed!" : "Case Cold!"}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {isWin 
            ? "Outstanding detective work. You cracked the code!" 
            : "You ran out of attempts. The suspect got away."}
        </p>

        {!isWin && secretWord && (
          <div className="mb-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Target Word</p>
            <p className="text-2xl font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              {secretWord}
            </p>
          </div>
        )}

        {/* Persistent Player Statistics */}
        {stats && (
          <div className="flex flex-row justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 shadow-inner border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col items-center flex-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.gamesPlayed}</span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Played</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Win %</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Streak</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.maxStreak}</span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Max</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="relative w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {copied ? (
              <span className="animate-pulse">Copied to clipboard!</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Share Result
              </>
            )}
          </button>
          
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 focus:outline-none"
          >
            Play Again
          </button>
        </div>

      </div>
    </div>
  );
}
