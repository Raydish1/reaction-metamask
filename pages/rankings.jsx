import { useState } from "react";
import RootLayout from "./layout";
import { useEffect } from "react";
import { getRankings } from "./api/brawlhalla.js";

import styled from "styled-components";

const RankingsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 125%;
  font-family: "Quicksand", sans-serif;
`;

const LeaderboardWrapper = styled.div`
  border: 3px solid gray;
  border-radius: 10px;
  overflow: hidden; /*corners were glitched visually without this*/
`;

const RankingHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr 1fr 2fr 1fr 1fr;
  padding: 20px;
  width: 1000px;
  font-weight: bold;
  background: #eee;
  color: black;
`;

const RankingRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr 1fr 2fr 1fr 1fr;
  padding: 20px;
  width: 1000px;
  background: #fff;
  color: black;

  &:nth-child(even) {
    background: rgb(226, 226, 226);
  }
`;

const RankingButton = styled.button`
  border: 2px solid gray;
  border-radius: 7px;
  width: 70px;
  height: 40px;
  font-size: 125%;
  font-family: "Quicksand", sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px;
`;
const CenteredDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
`;
const Header = styled.h1`
  font-family: "Quicksand", sans-serif;
  font-size: 40px;
`;
export default function Rankings() {
  const [displayedRankings, setDisplayedRankings] = useState(null);
  const [region, setRegion] = useState("us-e");
  const [mode, setMode] = useState("1v1");

  const handleModeClick = (mode) => {
    setMode(mode);
  };
  const handleRegionClick = (region) => {
    setRegion(region);
  };
  useEffect(() => {
    const getData = async () => {
      const data = await getRankings(mode, region, "1");
      setDisplayedRankings(data);
    };
    getData();
  }, [mode, region]);
  return (
    <RootLayout>
      <Header>Rankings</Header>
      <CenteredDiv>
        <RankingButton onClick={() => handleModeClick("1v1")}>
          1v1
        </RankingButton>
        <RankingButton onClick={() => handleModeClick("2v2")}>
          2v2
        </RankingButton>
      </CenteredDiv>
      <CenteredDiv>
        <RankingButton onClick={() => handleRegionClick("us-e")}>
          US-E
        </RankingButton>
        <RankingButton onClick={() => handleRegionClick("eu")}>
          EU
        </RankingButton>
        <RankingButton onClick={() => handleRegionClick("brz")}>
          BRZ
        </RankingButton>
        <RankingButton onClick={() => handleRegionClick("us-w")}>
          US-W
        </RankingButton>
        <RankingButton onClick={() => handleRegionClick("sea")}>
          SEA
        </RankingButton>
      </CenteredDiv>
      {displayedRankings ? (
        <RankingsContainer>
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

            {displayedRankings.map((player, index) => (
              <RankingRow key={player.id}>
                <span>{index + 1}</span>
                <span>{player.tier}</span>
                <span>{player.region}</span>
                {mode === "1v1" ? (
                  <span>{player.name}</span>
                ) : (
                  <span>{player.teamname}</span>
                )}
                <span>{player.games}</span>
                <span>
                  {player.wins}W / {player.games - player.wins}L
                </span>
                <span>{Math.round((player.wins / player.games) * 100)}%</span>
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
