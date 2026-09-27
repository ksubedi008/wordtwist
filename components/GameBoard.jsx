"use client";

import React from "react";
import LetterTile from "./LetterTile";

// The GameBoard expects an array of 'guesses', and a 'currentGuess' string.
export default function GameBoard({ guesses = [], currentGuess = "" }) {
  const MAX_GUESSES = 6;
  const WORD_LENGTH = 5;

  // Construct the active row based on the user's current typed letters
  const activeRow = Array.from({ length: WORD_LENGTH }).map((_, i) => ({
    letter: currentGuess[i] || "",
    status: "", // Not yet evaluated
    hasMultiple: false,
  }));

  // Build the complete board state
  const boardRows = [];

  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < guesses.length) {
      // Completed, evaluated rows
      boardRows.push({ rowData: guesses[i], isActive: false });
    } else if (i === guesses.length) {
      // The current active row the user is typing in
      boardRows.push({ rowData: activeRow, isActive: true });
    } else {
      // Empty, future rows
      boardRows.push({
        rowData: Array(WORD_LENGTH).fill({ letter: "", status: "", hasMultiple: false }),
        isActive: false
      });
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto grid grid-rows-6 gap-2 sm:gap-3 p-2">
      {boardRows.map((rowObj, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-2 sm:gap-3">
          {rowObj.rowData.map((letterData, colIndex) => (
            <LetterTile 
              key={`${rowIndex}-${colIndex}`} 
              letterData={letterData} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}
