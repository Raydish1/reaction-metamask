// --- pages/index.js ---
import React from "react";
import Game from "../components/Game"; // Assuming your Game.js is in the components directory

export default function Home() {
  return (
    <div>
      <h1>Decentralized Reaction Game</h1>
      <Game />
    </div>
  );
}
