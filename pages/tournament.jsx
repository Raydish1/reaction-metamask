import React, { useState, useEffect } from 'react';
import RootLayout from "./layout";
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  width: 50%; 
  margin: 20px auto; 
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white; 
  position: relative; 
  z-index: 1; 
  font-family: Quicksand;
`;

const BackgroundImage = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-image: url('/trophy-background.jpg');
  background-repeat: repeat; 
  background-size: auto 100%; 
  filter: grayscale(100%);
  opacity: 0.2;
  z-index: 0; 
`;

const SelectContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Select = styled.select`
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const TournamentList = styled.div`
  overflow-y: auto;
  max-height: 700px; 
  width: 100%; 
  
  
  border-top: 2px solid #111;
  display: flex;
  flex-direction: column; 
  align-items: center; 
`;

const TournamentItem = styled.div`
  margin-bottom: 15px; 
  padding: 10px;
  border-bottom: 1px solid #ccc;
  width: 95%;
`;

const TournamentTitle = styled.h3`
  cursor: pointer; 

  &:hover {
    text-decoration: underline; 
  }
`;

const Tournament = () => {
  const [selectedLeague, setSelectedLeague] = useState('brawlhalla-esports-year-nine-4');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [tournaments, setTournaments] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const leagueYears = [
    { slug: 'brawlhalla-esports-year-nine-4', year: 2024 },
    { slug: 'brawlhalla-esports-year-eight', year: 2023 },
    { slug: 'brawlhalla-esports-year-seven', year: 2022 },
    { slug: 'brawlhalla-esports-year-six', year: 2021 },
    { slug: 'brawlhalla-world-tour', year: 2020 },
    { slug: 'brawlhalla-esports-year-four', year: 2019 },
    { slug: 'brawlhalla-esports-year-three', year: 2018 },
    { slug: 'brawlhalla-circuit', year: 2017 },
  ];

  const regionOptions = [
    { value: 'all', label: 'All Regions' },
    { value: 'na', label: 'North America' },
    { value: 'eu', label: 'Europe' },
    { value: 'sa', label: 'South America' },
  ];

  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/startgg?type=schedule&leagueSlug=${selectedLeague}`);
        const data = await response.json();
        console.log("API Response:", data);
        if (data.schedule && data.schedule.nodes) {
          const filteredTournaments = data.schedule.nodes.filter((tournament) => {
            if (selectedRegion === 'all') {
              return true;
            }
            const tournamentName = tournament.tournament.name.toLowerCase();
            if (selectedRegion === 'na') {
              return tournamentName.includes('(na)') || tournamentName.includes('north america') || tournamentName.includes('na')
                     
            }
            if (selectedRegion === 'eu') {
              return tournamentName.includes('(eu)') || tournamentName.includes('europe') || tournamentName.includes('eu')
            }
            if (selectedRegion === 'sa') {
              return tournamentName.includes('brazil') || tournamentName.includes('south america') ||
                     tournamentName.includes('(sa)') || tournamentName.includes('(brz)') || tournamentName.includes('brz') 
                     || tournamentName.includes('sa')

            }
            return true;
          });
          setTournaments(filteredTournaments);
        } else {
          console.error("Failed to fetch tournaments:", data.error);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, [selectedLeague, selectedRegion]);

  const handleLeagueChange = (event) => {
    setSelectedLeague(event.target.value);
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  const handleTournamentClick = (tournamentSlug) => {
    console.log(tournamentSlug)
    window.open(`https://start.gg/${tournamentSlug}`, '_blank');
  };

  return (
    <RootLayout>
      <BackgroundImage />
      <Container>
        <h1>Tournament Viewer</h1>
        <SelectContainer>
          <div>
            <label htmlFor="leagueSelect">Tournament Year: </label>
            <Select id="leagueSelect" value={selectedLeague} onChange={handleLeagueChange}>
              {leagueYears.map((league) => (
                <option key={league.slug} value={league.slug}>
                  {league.year}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="regionSelect">Region:  </label>
            <Select id="regionSelect" value={selectedRegion} onChange={handleRegionChange}>
              {regionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </SelectContainer>

        {isLoading ? (
          <p>Loading tournaments...</p>
        ) : (
          <TournamentList>
            {tournaments && tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <TournamentItem key={tournament.id}>
                    
                  <TournamentTitle onClick={() => handleTournamentClick(tournament.slug)}>
                    {tournament.tournament.name}
                  </TournamentTitle>
                  <p>Start Date: {new Date(tournament.startAt * 1000).toLocaleDateString()}</p>
                  <p>Winner: {tournament.firstPlace}</p>
                </TournamentItem>
                
              ))
            ) : (
              <p>No tournaments found.</p>
            )}
          </TournamentList>
        )}
      </Container>
    </RootLayout>
  );
};

export default Tournament;