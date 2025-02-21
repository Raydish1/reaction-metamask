import RootLayout from "./layout";
import PromptCard from "../components/PromptCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { searchPlayer } from "./api/brawlhalla.js";
import {searchByName} from "./api/brawlhalla.js";

const Stats = () => {
  const router = useRouter();
  const brawlhalla_id = router.query.id;
  
  const [rankedData, setRankedData] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    
    const fetchData = async () => {
      if (brawlhalla_id) {
        try {
          const data = await searchPlayer(brawlhalla_id);
          setPlayerData(data.playerStats);
          setRankedData(data.rankedStats);
        } catch (err) {
          console.error("Error fetching player data:", err);
        }
      }
    };

    fetchData();
  }, [router.query]); // Refetch when ID changes

  return (
    <RootLayout>
      <PromptCard />
      {playerData && rankedData && (
        <div>
          <p>Name: {playerData.name}</p>
          {playerData.clan && <p>Clan: {playerData.clan.clan_name}</p>}
          <p>Elo: {rankedData.rating}</p>
          <p>
            Wins: {rankedData.wins}, Games: {rankedData.games}, WR:{" "}
            {rankedData.wins / rankedData.games}
          </p>

          <pre>
            {JSON.stringify(playerData, null, 2) +
              JSON.stringify(rankedData, null, 2)}
          </pre>
        </div>
      )}
    </RootLayout>
  );
};

export default Stats;
