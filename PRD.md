1. Project Overview

A web-based, 5-letter word guessing game deployed on Vercel. Players have 6 attempts to guess the hidden target word. The game introduces a unique "Detective's Tally" mechanic: players are explicitly notified if a correctly guessed letter appears multiple times in the target word.
2. Technical Stack (Developer Selections)

As the lead developer, I have selected the following stack to ensure lightning-fast performance, maximum security, and seamless Vercel deployment:

    Framework: Next.js (App Router) with React.

    Styling: Tailwind CSS (natively handles responsiveness and theming).

    Theme Management: next-themes (prevents theme-flickering on page load).

    Backend Validation: Vercel Edge/Serverless API Routes.

    Storage: Client-side localStorage for game session persistence.

3. Core Gameplay Mechanics

    Grid Layout: 6 rows by 5 columns.

    Input Methods: Virtual on-screen keyboard and physical keyboard support (with Enter and Backspace mapped).

    Feedback System (The Two-Pen Logic):

        Green (Correct): Correct letter, correct spot.

        Yellow (Present): Correct letter, wrong spot.

        Gray (Absent): Letter is not in the word.

    The Unique Hook (Repeat Hint): If a letter tile evaluates to Green or Yellow, and that specific letter appears multiple times in the hidden word, the tile will display a small pulsing "x2" badge.

    Side Panel (Alphabet Tracker): A visual dictionary alongside the board that updates each letter of the alphabet to its highest achieved state (Green > Yellow > Gray).

4. UI/UX & Responsive Design Requirements

    Mobile-First Approach:

        On mobile screens (< 768px), the Side Panel hides behind a toggleable hamburger menu or bottom sheet to save screen real estate. The game board and virtual keyboard take up 100% of the viewport.

        On desktop screens (>= 768px), the grid is centered, and the Side Panel sits fixed on the right or left side.

    Theming:

        Full Light/Dark mode support.

        Must respect the user's system preference by default using window.matchMedia('(prefers-color-scheme: dark)').

        A manual toggle switch must be accessible in the header.

    Animations:

        Invalid Word: Horizontal CSS shake animation.

        Tile Flip: Staggered 3D rotation reveal when a row is submitted.

5. Security & Repository Guidelines

To ensure zero secrets are leaked to GitHub while maintaining a secure game environment:

    The .gitignore Firewall: The .env, .env.local, and .env.production files MUST be strictly included in the .gitignore file from the very first commit.

    Server-Side Secrets: The target word generation logic (or daily word seed) will be stored in Vercel's Environment Variables dashboard (SECRET_GAME_SEED).

    Blind Client: The frontend React code will never receive the target word. It will only send the user's guess via a POST request to the Next.js API route. The API route holds the secrets, runs the validation, and returns only the color/hint array.

6. Edge Cases & Error Handling

    Dictionary Validation: Guesses must be checked against a comprehensive list of valid 5-letter English words before being sent to the API. If invalid, the UI rejects the submission to save API calls.

    Mid-Game Abandonment: The current board state and active row integer must be synced to localStorage on every keystroke. If the tab is closed and reopened, the game hydrates seamlessly.

    API Failure: Wrap the API call in a try/catch. If the Vercel API times out or fails, display a warm, user-friendly toast notification ("Network hiccup! Try hitting Enter again.") rather than crashing the board.