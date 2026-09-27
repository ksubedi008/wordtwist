import React from "react";

// Highly compact, responsive flex-row component that acts as a color key.
// On mobile, text scales down and the gap reduces to fit cleanly above the board.
export default function Legend() {
  return (
    <div className="flex flex-row justify-center items-center gap-3 sm:gap-6 w-full mb-6">
      
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="flex w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-sm shadow-sm" aria-hidden="true" />
        <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
          Correct spot
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="flex w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-sm shadow-sm" aria-hidden="true" />
        <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
          Wrong spot
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="flex w-3 h-3 sm:w-4 sm:h-4 bg-gray-500 dark:bg-gray-600 rounded-sm shadow-sm" aria-hidden="true" />
        <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
          Not in word
        </span>
      </div>

    </div>
  );
}
