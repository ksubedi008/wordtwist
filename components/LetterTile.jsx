import React from "react";

export default function LetterTile({ letterData }) {
  const { letter, status, hasMultiple } = letterData;

  // Determine the background and text color based on the status
  let bgColorClass = "bg-transparent border-2 border-gray-300 dark:border-gray-700 text-black dark:text-white"; // Empty state
  
  if (status === "correct") {
    bgColorClass = "bg-green-500 border-green-500 text-white";
  } else if (status === "present") {
    bgColorClass = "bg-yellow-500 border-yellow-500 text-white";
  } else if (status === "absent") {
    bgColorClass = "bg-gray-500 dark:bg-gray-600 border-gray-500 dark:border-gray-600 text-white";
  } else if (letter && !status) {
    // Active typing state (letter is entered but not submitted yet)
    bgColorClass = "bg-transparent border-2 border-gray-500 dark:border-gray-400 text-black dark:text-white";
  }

  return (
    <div
      className={`relative w-full aspect-square flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase select-none transition-all duration-300 rounded-md ${bgColorClass}`}
    >
      {letter}

      {/* The Detective's Tally Indicator */}
      {hasMultiple && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] sm:text-xs text-white font-bold shadow-md animate-pulse z-10 border-2 border-white dark:border-gray-950">
          x2
        </span>
      )}
    </div>
  );
}
