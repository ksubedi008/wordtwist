import { NextResponse } from "next/server";
import { TARGET_WORDS } from "@/utils/wordList";

// Helper to calculate the 'Detective Tally' with repeat hints
function evaluateGuessWithRepeatHint(guess, target) {
  const result = Array(5).fill({ letter: "", status: "absent", hasMultiple: false });
  const targetCounts = {};

  // Count occurrences of each letter in the target word
  for (const char of target) {
    targetCounts[char] = (targetCounts[char] || 0) + 1;
  }

  // First pass: identify correct (green) letters
  for (let i = 0; i < 5; i++) {
    const char = guess[i];
    if (char === target[i]) {
      result[i] = { letter: char, status: "correct", hasMultiple: targetCounts[char] > 1 };
      targetCounts[char] -= 1;
    }
  }

  // Second pass: identify present (yellow) and absent (gray) letters
  for (let i = 0; i < 5; i++) {
    const char = guess[i];
    if (result[i].status !== "correct") {
      if (targetCounts[char] > 0) {
        result[i] = { letter: char, status: "present", hasMultiple: targetCounts[char] > 1 };
        targetCounts[char] -= 1;
      } else {
        result[i] = { letter: char, status: "absent", hasMultiple: false };
      }
    }
  }

  return result;
}

export async function POST(req) {
  try {
    const { guess, isFinalGuess, mode, seed } = await req.json();

    if (!guess || guess.length !== 5 || !/^[A-Z]{5}$/i.test(guess)) {
      return NextResponse.json({ error: "Invalid guess format" }, { status: 400 });
    }

    const normalizedGuess = guess.toUpperCase();
    let targetWord = "";

    if (mode === "random") {
      // Free play mode: derive word deterministically from the client's seed
      const safeSeed = typeof seed === "number" ? seed : 0;
      targetWord = TARGET_WORDS[safeSeed % TARGET_WORDS.length].toUpperCase();
    } else {
      // Daily mode: global daily word based on UTC day (Since Jan 1, 2024)
      const EPOCH = new Date("2024-01-01T00:00:00Z").getTime();
      const now = Date.now();
      const daysSinceEpoch = Math.floor((now - EPOCH) / (1000 * 60 * 60 * 24));
      
      // Fallback in case daysSinceEpoch is negative
      const index = Math.abs(daysSinceEpoch) % TARGET_WORDS.length;
      targetWord = TARGET_WORDS[index].toUpperCase();
    }

    const result = evaluateGuessWithRepeatHint(normalizedGuess, targetWord);
    const isWin = normalizedGuess === targetWord;

    const responsePayload = {
      result,
      isWin,
    };

    // Obey the Blind Client Principle: reveal the word only when the user loses the game entirely
    if (!isWin && isFinalGuess) {
      responsePayload.secretWord = targetWord;
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
