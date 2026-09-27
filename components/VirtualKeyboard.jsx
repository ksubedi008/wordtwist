import React from "react";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DELETE"],
];

export default function VirtualKeyboard({ usedLetters, onKeyPress, onEnter, onDelete }) {
  // Helper to resolve the correct Tailwind classes based on the letter's historical status
  const getKeyStyle = (keyChar) => {
    const status = usedLetters[keyChar];

    if (status === "correct") {
      return "bg-green-500 text-white hover:bg-green-600";
    }
    if (status === "present") {
      return "bg-yellow-500 text-white hover:bg-yellow-600";
    }
    if (status === "absent") {
      return "bg-gray-500 dark:bg-gray-700 text-white hover:bg-gray-600 dark:hover:bg-gray-600";
    }
    // Default un-guessed key
    return "bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700";
  };

  const handleKeyClick = (key) => {
    if (key === "ENTER") onEnter();
    else if (key === "DELETE") onDelete();
    else onKeyPress(key);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-2 mt-4 px-2 sm:px-0 select-none">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2">
          {row.map((key) => {
            const isActionKey = key === "ENTER" || key === "DELETE";
            
            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className={`
                  flex items-center justify-center rounded font-bold transition-colors shadow-sm
                  ${isActionKey ? "px-2 sm:px-4 text-[10px] sm:text-xs min-w-[3rem] sm:min-w-[4rem]" : "flex-1 min-w-[1.5rem] sm:min-w-[2.5rem] text-sm sm:text-base"}
                  h-12 sm:h-14
                  ${isActionKey ? "bg-gray-300 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600" : getKeyStyle(key)}
                `}
                aria-label={key}
              >
                {key === "DELETE" ? (
                  // SVG for Backspace
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                  </svg>
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
