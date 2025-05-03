// --- pages/index.js ---
import React from "react";
import Game from "../components/Game"; // Assuming your Game.js is in the components directory
import RootLayout from "./layout";

export default function Home() {
  return (
    <RootLayout>
      <Game />
    </RootLayout>
  );
}
