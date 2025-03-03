import React, { useState, useEffect } from 'react';
import RootLayout from "./layout";

const Tournament = () => {
    const [selectedLeague, setSelectedLeague] = useState('brawlhalla-esports-year-nine-4');
    const [tournaments, setTournaments] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);

    const leagueSlugs = [
        'brawlhalla-esports-year-nine-4',
        'brawlhalla-esports-year-eight',
        'brawlhalla-esports-year-seven',
        'brawlhalla-esports-year-six',
        'brawlhalla-world-tour',
        'brawlhalla-esports-year-four',
        'brawlhalla-esports-year-three',
        'brawlhalla-circuit'
    ];

    useEffect(() => {
        const fetchTournaments = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/startgg?type=schedule&leagueSlug=${selectedLeague}`);
                const data = await response.json();
                console.log("API Response:", data); 
                if (data.schedule) {
                    setTournaments(data.schedule.nodes);
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
    }, [selectedLeague]);

    const handleLeagueChange = (event) => {
        setSelectedLeague(event.target.value);
    };

    return (
        <RootLayout>
            <div>
                <label htmlFor="leagueSelect">Select League:</label>
                <select id="leagueSelect" value={selectedLeague} onChange={handleLeagueChange}>
                    {leagueSlugs.map((slug, index) => (
                        <option key={slug} value={slug}>
                            {2024 - index}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <p>Loading tournaments...</p>
            ) : (
                <div className="tournament-list" style={{ overflowY: 'auto', maxHeight: '300px' }}>
                    {tournaments && tournaments.length > 0 ? ( // if tournaments exists
                        tournaments.map(tournament => (
                            <div key={tournament.id}>
                                <h3>{tournament.tournament.name}</h3>
                                <p>Start Date: {new Date(tournament.startAt * 1000).toLocaleDateString()}</p>
                            </div>
                        ))
                    ) : (
                        <p>No tournaments found.</p>
                    )}
                </div>
            )}
        </RootLayout>
    );
};

export default Tournament;