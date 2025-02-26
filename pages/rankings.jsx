import { useState } from "react";
import RootLayout from "./layout";
import { useEffect } from "react";
import { getRankings } from "./api/brawlhalla.js";

import styled from 'styled-components';

const RankingsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size:125%;
  font-family: 'Quicksand', sans-serif;
`;

const LeaderboardWrapper = styled.div`
  border: 3px solid gray;
  border-radius: 10px;  /* Optional: Adds rounded corners */
  overflow: hidden;  /* Ensures child elements don't overflow */
`;

const RankingHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr 1fr 2fr 1fr 1fr;
  padding: 20px;
  width: 1000px;
  font-weight: bold;
  background: #EEE;
  color: black;
`;

const RankingRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr 1fr 2fr 1fr 1fr;
  padding: 20px;
  width: 1000px;
  background: #FFF;
  color: black;
  
  &:nth-child(even) {
    background:rgb(226, 226, 226);
  }
`;
export default function Rankings() {
  const [displayedRankings, setDisplayedRankings] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const data = await getRankings("1v1", "us-e", "1");
      setDisplayedRankings(data);
    };
    getData();
  }, []);
  return (
    <RootLayout>
      <h1>Rankings</h1>
      {displayedRankings ? (
    <RankingsContainer>
      {/* Header Row */}
      <LeaderboardWrapper>
      <RankingHeader>
        <span>Rank</span>
        <span>Tier</span>
        <span>Region</span>
        <span>Name</span>
        <span>Games</span>
        <span>W/L</span>
        <span>Winrate</span>
        <span>Elo</span>
      </RankingHeader>

      {/* Ranking Rows */}
      {displayedRankings.map((player, index) => (
        <RankingRow key={player.id}>
          <span>{index + 1}</span> {/* Rank */}
          <span>{player.tier}</span>
          <span>{player.region}</span>
          <span>{player.name}</span>
          <span>{player.games}</span>
          <span>{player.wins}W / {player.losses}L</span>
          <span>{player.winrate}%</span>
          <span>{player.rating}</span>
        </RankingRow>
      ))}
    </LeaderboardWrapper>
    </RankingsContainer>
  ) : (
        <p>Loading...</p>
      )}
    </RootLayout>
  );
}