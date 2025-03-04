import RootLayout from "./layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { searchPlayer } from "./api/brawlhalla.js";
import styled from "styled-components";
import FavoriteButton from "../components/FavoriteButton";
import PromptCard from "../components/PromptCard";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  font-family: 'Quicksand', sans-serif;
  width: 100%;
  //height: 100vh;

  background-image: url('/triangle-background.png');
  max-height: 100vh;
  min-height: 95vh;
  overflow-y: hidden;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 20px;
  width: 100%;
  height: 100%;
  margin-top:20px;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 35vw;
  padding-left:20px;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 20px;
  width: 100%;

  h1 {
    font-size: 3em;
    margin-bottom: 0;
    text-align: left;
    margin-right: 10px;
  }
`;

const H3 = styled.h2`
margin-top:2px;
  margin-bottom:5px;
`;

const ImageContainer = styled.div`
  width: 100%;

  height: auto;
  max-height: 770px;
  overflow: hidden;
`;

const StatsContainer = styled.div`
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  height: 86vh;
  width: 50vw;
  background:white;
  display: flex;
  flex-direction: column;
`;

const StyledImage = styled.img`
  object-fit: contain;
  width: 100%;
  height: 100%;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 0px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 3px solid ${({ active }) => (active ? "#333" : "transparent")};
  font-weight: ${({ active }) => (active ? "600" : "normal")};
  outline: none;
  font-size: 16px;
  color: #333;
  transition: border-bottom 0.3s ease;
  font-family:Quicksand;
`;

const TabContent = styled.div`
  padding: 20px 0;
  width: 100%;
  overflow-y: auto; // Add scroll here
  
`;

const H2 = styled.h2`
  font-size: 1.2em;
  margin-bottom: 10px;
  color: #333;
`;

const StatItem = styled.div`
  margin-bottom: 0px;
  margin-top:10px;
  font-size: 16px;
  color: #000;
`;

const TierImage = styled.img`
  width: 150px;
  margin: 10px 0;
`;

const OverviewStats = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const RatingText = styled.div`
  margin-left: 20px;
  margin-top:10px;
  display: flex;
  flex-direction: column;
`;

const CurrentRating = styled.span`
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom:5px;
`;

const PeakRating = styled.span`
  font-size: 1em;
`;

const PromptContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background:white;
  padding:50px;
`;

const PromptText = styled.h2`
  margin-bottom: 20px;
  font-size: 1.8em;
  color: #333;
`;

const Stats = () => {
  const router = useRouter();
  const brawlhalla_id = router.query.id;
  const [rankedData, setRankedData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    const fetchData = async () => {
      if (brawlhalla_id) {
        try {
          const data = await searchPlayer(brawlhalla_id);
          setPlayerData(data.playerStats);
          if (data.rankedStats && data.rankedStats["2v2"]) { //sorting teams by rating
            data.rankedStats["2v2"].sort((a, b) => b.rating - a.rating);
          }
          setRankedData(data.rankedStats);
        } catch (err) {
          console.error("Error fetching player data:", err);
        }
      }
    };
    fetchData();
  }, [router.query]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const getTierImage = (tier) => {
    if (tier.includes("Platinum")) {
      return "Platinum";
    } else if (tier.includes("Gold")) {
      return "Gold";
    } else if (tier.includes("Silver")) {
      return "Silver";
    } else {
      return tier;
    }
  };

  return (
    <RootLayout>
      <Container>
        {playerData && rankedData ? (
          <ContentWrapper>
            <LeftColumn>
              <Header>
                <h1>{playerData.name}</h1>
                <FavoriteButton
                  rankedData={rankedData}
                  playerId={playerData.brawlhalla_id}
                  legend={router.query.legend}
                />
              </Header>
              <ImageContainer>
                <StyledImage
                  src={`/splash/Official_Artwork_${
                    router.query.legend.charAt(0).toUpperCase() +
                    router.query.legend.slice(1)
                  }.webp`}
                />
              </ImageContainer>
            </LeftColumn>
            <StatsContainer>
              <Tabs>
                <Tab
                  active={activeTab === "Overview"}
                  onClick={() => handleTabClick("Overview")}
                >
                  Overview
                </Tab>
                <Tab
                  active={activeTab === "2v2"}
                  onClick={() => handleTabClick("2v2")}
                >
                  2v2
                </Tab>
                <Tab
                  active={activeTab === "Legends"}
                  onClick={() => handleTabClick("Legends")}
                >
                  Legends
                </Tab>
              </Tabs>
              <TabContent>
                {activeTab === "Overview" && (
                  <div>
                    <H2>Ranked Season</H2>
                    <OverviewStats>
                      <TierImage
                        src={`/Banner_Rank_${getTierImage(
                          rankedData.tier
                        )}.webp`}
                        alt={`${rankedData.tier} Banner`}
                      />
                      <RatingText>
                        <CurrentRating>ELO: {rankedData.rating} </CurrentRating>
                        <PeakRating>
                          Peak: {rankedData.peak_rating}
                        </PeakRating>
                        <StatItem>
                          W/L: {rankedData.wins}-{rankedData.games}
                        </StatItem>
                        <StatItem>Region: {rankedData.region}</StatItem>
                      </RatingText>
                    </OverviewStats>
                    
                      <div>
                      <H2>Best 2v2 Team</H2>
                      {rankedData["2v2"].length > 0 ? (
                      <OverviewStats>
                      <TierImage
  src={`/Banner_Rank_${getTierImage(rankedData["2v2"][0].tier)}.webp`}
  alt={`${rankedData["2v2"][0].tier} Banner`}
/>
                      <RatingText>
                      <H3>{rankedData["2v2"][0].teamname}</H3>
                      <CurrentRating>ELO: {rankedData["2v2"][0].rating}</CurrentRating>
                      <PeakRating>
                      Peak: {rankedData["2v2"][0].peak_rating}
                      </PeakRating>
                      <StatItem>
                      W/L: {rankedData["2v2"][0].wins}-
                      {rankedData["2v2"][0].games}
                      </StatItem>
                      <StatItem>Region: {rankedData.region}</StatItem>
                      </RatingText>
                      </OverviewStats>
                      ) : (
                      <StatItem>Player has no 2v2 teams.</StatItem>
                      )}
                      </div>
                      <div>
                      <H2>Clan</H2>
                      {playerData.clan ? (
                        <StatItem>{playerData.clan.clan_name}</StatItem>
                      ) : (
                      <StatItem>Player is not in a clan.</StatItem>
                      )}
                      </div>
                      </div>
                      )}
                      {activeTab === "2v2" && (
                      <div>
                      {rankedData["2v2"].length > 0 ? (
                      rankedData["2v2"].map((team, index) => (
                        <div key={index}>
                        <StatItem>Team: {team.teamname}</StatItem>
                        <StatItem>Rating: {team.rating}</StatItem>
                        <StatItem>Peak Rating: {team.peak_rating}</StatItem>
                        <StatItem>Tier: {team.tier}</StatItem>
                        <StatItem>
                          W/L: {team.wins} - {team.games - team.wins}
                        </StatItem>
                        <hr />
                      </div>
                      ))
                      ) : (
                      <StatItem>Player has no 2v2 teams.</StatItem>
                      )}
                      </div>
                      )}
                      {activeTab === "Legends" && (
                      <div>
                      {playerData.legends
                      .sort((a, b) => b.xp - a.xp)
                      .map((legend, index) => (
                      <div key={index}>
                      <StatItem>Legend: {legend.legend_name_key}</StatItem>
                      <StatItem>
                      Level: {legend.level}, XP: {legend.xp}
                      </StatItem>
                      <StatItem>
                      Damage Dealt: {legend.damagedealt}, Damage Taken:{" "}
                      {legend.damagetaken}
                      </StatItem>
                      <StatItem>
                      KOs: {legend.kos}, Falls: {legend.falls}
                      </StatItem>
                      <hr />
                      </div>
                      ))}
                      </div>
                      )}
                      </TabContent>
                      </StatsContainer>
                      </ContentWrapper>
                      ) : (
                      <PromptContainer>
                      <PromptText>Search a player to see their stats!</PromptText>
                      <PromptCard />
                      </PromptContainer>
                      )}
                      </Container>
                      </RootLayout>
                      );
                      };
                      
                      export default Stats;