/*
Page that displays top 50 ranked leaderboards. 
Allows user to switch between regions/gamemodes
*/

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
  padding-bottom:30px;
  
`;

const LeaderboardWrapper = styled.div`
  border: 3px solid gray;
  border-radius: 10px;
  overflow: hidden; /*corners were glitched visually without this*/
`;

const RankingHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2.5fr 1fr 2fr 1fr 1fr;
  padding: 20px;
  width: 1000px;
  font-weight: bold;
  background: #eee;
  color: black;
`;

const RankingRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2.5fr 1fr 2fr 1fr 1fr;
  padding: 20px;
  width: 1000px;
  background: #fff;
  color: black;

  &:nth-child(even) { //every other row is shaded
    background: rgb(226, 226, 226);
  }

  & > span:nth-child(4) { /* adding padding to the 4th span, Name column */
    padding-right: 15px; 
  }
`;

const RankingButton = styled.button`
  
  border-radius: 7px;
  width: 70px;
  height: 40px;
  font-size: 125%;
  font-family: "Quicksand", sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px;
  border: ${(props) => (props.selected ? "2px solid black" : "2px solid gray")}; 
  transition:0.2s;
`;
const CenteredDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
`;
const Header = styled.h1`
  font-family: "Quicksand", sans-serif;
  font-size: 100px;
  margin:0px;
  padding:0px;
  margin-bottom:30px;
  padding-top:20px;
  text-align: center;
`;

const Container = styled.div`
  background-image: url('/triangle-background.png');
  height:110%;
  
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
      <Container>
      <Header>Rankings</Header>
      <CenteredDiv>
  <RankingButton
    onClick={() => handleModeClick("1v1")}
    selected={mode === "1v1"} // pass true if current mode is 1v1
  >
    1v1
  </RankingButton>
  <RankingButton
    onClick={() => handleModeClick("2v2")}
    selected={mode === "2v2"} 
  >
    2v2
  </RankingButton>
</CenteredDiv>
<CenteredDiv>
  <RankingButton
    onClick={() => handleRegionClick("us-e")}
    selected={region === "us-e"} // pass true if current region is us-e
  >
    US-E
  </RankingButton>
  <RankingButton
    onClick={() => handleRegionClick("eu")}
    selected={region === "eu"} 
  >
    EU
  </RankingButton>
  <RankingButton
    onClick={() => handleRegionClick("brz")}
    selected={region === "brz"} 
  >
    BRZ
  </RankingButton>
  <RankingButton
    onClick={() => handleRegionClick("us-w")}
    selected={region === "us-w"} 
  >
    US-W
  </RankingButton>
  <RankingButton
    onClick={() => handleRegionClick("sea")}
    selected={region === "sea"} 
  >
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
      </Container>
    </RootLayout>
  );
}
