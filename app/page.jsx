"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import GameBoard from "@/components/GameBoard";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import EndGameModal from "@/components/EndGameModal";
import Legend from "@/components/Legend";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Dual-Mode Settings
  const [gameMode, setGameMode] = useState("daily"); // "daily" or "random"
  const [randomSeed, setRandomSeed] = useState(0);

  // Core Game State (Volatile: resets on every page load or mode switch)
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameState, setGameState] = useState("playing"); // playing, won, lost
  const [usedLetters, setUsedLetters] = useState({});
  const [secretWord, setSecretWord] = useState("");

  // UI State
  const [toastMessage, setToastMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Persistent Statistics (Separated into two distinct keys as requested)
  const [statsDaily, setStatsDaily] = useState({ gamesPlayed: 0, wins: 0, currentStreak: 0, maxStreak: 0 });
  const [statsRandom, setStatsRandom] = useState({ gamesPlayed: 0, wins: 0, currentStreak: 0, maxStreak: 0 });

  const WORD_LENGTH = 5;
  const MAX_GUESSES = 6;

  // Generate initial random seed on client side
  useEffect(() => {
    setRandomSeed(Math.floor(Math.random() * 1000000));
  }, []);

  // Hydrate BOTH statistics sets from distinct localStorage keys safely after mount
  useEffect(() => {
    setMounted(true);

    const savedDaily = localStorage.getItem("wordtwist_stats_daily");
    if (savedDaily) {
      try {
        setStatsDaily(JSON.parse(savedDaily));
      } catch (e) {
        console.error("Failed to parse daily stats", e);
      }
    }

    const savedRandom = localStorage.getItem("wordtwist_stats_random");
    if (savedRandom) {
      try {
        setStatsRandom(JSON.parse(savedRandom));
      } catch (e) {
        console.error("Failed to parse random stats", e);
      }
    }
  }, []);

  // Save Daily stats to localStorage whenever they change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("wordtwist_stats_daily", JSON.stringify(statsDaily));
  }, [statsDaily, mounted]);

  // Save Random stats to localStorage whenever they change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("wordtwist_stats_random", JSON.stringify(statsRandom));
  }, [statsRandom, mounted]);

  // Confetti trigger for wins
  useEffect(() => {
    if (gameState === "won") {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#6366F1", "#F59E0B"]
      });
    }
  }, [gameState]);

  const updateStats = useCallback((isWin) => {
    const updateFn = (prev) => {
      const newStats = { ...prev };
      newStats.gamesPlayed += 1;
      if (isWin) {
        newStats.wins += 1;
        newStats.currentStreak += 1;
        newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
      } else {
        newStats.currentStreak = 0; // Reset streak on loss
      }
      return newStats;
    };

    if (gameMode === "daily") {
      setStatsDaily(updateFn);
    } else {
      setStatsRandom(updateFn);
    }
  }, [gameMode]);

  const handleGuessSubmit = useCallback(async () => {
    if (currentGuess.length !== WORD_LENGTH || gameState !== "playing") return;

    // Determine if this is the user's final attempt
    const isFinalGuess = guesses.length === MAX_GUESSES - 1;

    try {
      const response = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess: currentGuess, isFinalGuess, mode: gameMode, seed: randomSeed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setToastMessage(data.error || "Something went wrong.");
        setTimeout(() => setToastMessage(""), 2000);
        return;
      }

      // Advance GameBoard state
      const newGuesses = [...guesses, data.result];
      setGuesses(newGuesses);
      setCurrentGuess("");

      // Update Alphabet Tracker
      setUsedLetters((prev) => {
        const newUsedLetters = { ...prev };
        data.result.forEach(({ letter, status }) => {
          const currentStatus = newUsedLetters[letter];
          if (status === "correct") {
            newUsedLetters[letter] = "correct";
          } else if (status === "present" && currentStatus !== "correct") {
            newUsedLetters[letter] = "present";
          } else if (status === "absent" && currentStatus !== "correct" && currentStatus !== "present") {
            newUsedLetters[letter] = "absent";
          }
        });
        return newUsedLetters;
      });

      // Handle win/loss, update stats, and reveal secret word if provided
      if (data.isWin) {
        setGameState("won");
        setIsModalOpen(true);
        updateStats(true);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameState("lost");
        setIsModalOpen(true);
        updateStats(false);
        if (data.secretWord) {
          setSecretWord(data.secretWord);
        }
      }
    } catch (error) {
      setToastMessage("Network hiccup! Try hitting Enter again.");
      setTimeout(() => setToastMessage(""), 2000);
    }
  }, [currentGuess, guesses, gameState, updateStats, gameMode, randomSeed]);

  // DRY functions
  const onKeyPress = useCallback((key) => {
    if (gameState !== "playing") return;
    if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  }, [currentGuess, gameState]);

  const onDelete = useCallback(() => {
    if (gameState !== "playing") return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameState]);

  const resetGame = (isManualSkip = false) => {
    // Instantly reset the volatile board state.
    if (isManualSkip === true || gameMode === "random") {
      setRandomSeed(Math.floor(Math.random() * 1000000));
    }
    setGuesses([]);
    setCurrentGuess("");
    setUsedLetters({});
    setGameState("playing");
    setSecretWord("");
    setIsModalOpen(false);
  };

  const switchMode = (mode) => {
    if (mode === gameMode) return;
    setGameMode(mode);
    setGuesses([]);
    setCurrentGuess("");
    setUsedLetters({});
    setGameState("playing");
    setSecretWord("");
    setIsModalOpen(false);
    if (mode === "random") {
      setRandomSeed(Math.floor(Math.random() * 1000000));
    }
  };

  // Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") handleGuessSubmit();
      else if (e.key === "Backspace") onDelete();
      else if (/^[a-zA-Z]$/.test(e.key)) onKeyPress(e.key.toUpperCase());
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGuessSubmit, onDelete, onKeyPress]);

  return (
    <div className="min-h-screen flex flex-col items-center p-2 sm:p-8">
      <header className="w-full max-w-lg flex justify-between items-center mb-4 sm:mb-6">
        <h1
          onClick={() => window.location.reload()}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 cursor-pointer hover:opacity-80 transition-opacity"
        >
          WordTwist
        </h1>
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none"
            aria-label="Toggle Dark Mode"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 3.22a1 1 0 011.415 1.414l-.708.707a1 1 0 01-1.414-1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-3.22 4.22a1 1 0 011.414 1.415l-.707.708a1 1 0 01-1.415-1.414l.707-.708zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-3.22a1 1 0 01-1.414 1.415l-.708-.707a1 1 0 011.415-1.414l.707.708zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm3.22-4.22a1 1 0 01-1.415 1.414L5.098 6.5A1 1 0 016.51 5.086l.707.707z" clipRule="evenodd" /><path d="M10 6a4 4 0 100 8 4 4 0 000-8z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>
        )}
      </header>

      {/* Mode Selection UI: Sleek Tailwind Toggle Switch */}
      <div className="relative w-full max-w-sm flex items-center bg-gray-200 dark:bg-gray-800 p-1 rounded-full mb-6 shadow-inner">
        {/* Sliding indicator background */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-700 rounded-full shadow-md transition-transform duration-300 ease-in-out ${gameMode === "daily" ? "translate-x-0" : "translate-x-full"
            }`}
        />
        <button
          onClick={() => switchMode("daily")}
          className={`relative z-10 flex-1 py-2 text-sm font-bold rounded-full transition-colors duration-300 focus:outline-none ${gameMode === "daily"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          Daily Word
        </button>
        <button
          onClick={() => switchMode("random")}
          className={`relative z-10 flex-1 py-2 text-sm font-bold rounded-full transition-colors duration-300 focus:outline-none ${gameMode === "random"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          Free Play
        </button>
      </div>

      <main className="w-full max-w-lg flex-grow flex flex-col items-center gap-4 sm:gap-6">

        <Legend />

        <div className="h-6 flex items-center justify-center -mt-2">
          {toastMessage && (
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-md font-bold text-sm shadow-lg transition-all animate-pulse">
              {toastMessage}
            </div>
          )}
        </div>

        <GameBoard guesses={guesses} currentGuess={currentGuess} />

        {gameMode === "random" && gameState === "playing" && (
          <button
            onClick={() => resetGame(true)}
            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider mt-2 focus:outline-none"
          >
            ↻ Skip & New Word
          </button>
        )}

        <VirtualKeyboard
          usedLetters={usedLetters}
          onKeyPress={onKeyPress}
          onDelete={onDelete}
          onEnter={handleGuessSubmit}
        />
      </main>

      {/* End Game Modal */}
      <EndGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gameState={gameState}
        secretWord={secretWord}
        onPlayAgain={() => resetGame(false)}
        stats={gameMode === "daily" ? statsDaily : statsRandom}
        guesses={guesses}
      />

      {/* Developer Footer */}
      <footer className="w-full mt-auto py-6 flex flex-col items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-2">Developed by: Kamal</p>
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/k_subedi08/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            Instagram
          </a>
          <span>•</span>
          <a
            href="https://kamal-subedi.com.np/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            Portfolio
          </a>
        </div>
      </footer>
    </div>
  );
}
