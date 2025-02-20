import { useState } from "react";
import { searchPlayer } from "../pages/api/brawlhalla.js";
import { useRouter } from "next/router";
import styles from "./PromptCard.module.css";

const PromptCard = () => {
  const [text, setText] = useState(""); //Text box input
  const [rankedData, setRankedData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setText(e.target.value); //When you type in the input box, it changes the text
  };

  const handleSearch = async () => {
    try {
      const data = await searchPlayer(text); //Calls searchPlayer function from api file
      console.log("searched data");
      console.log(data);
      setRankedData(data.rankedStats);
      setPlayerData(data.playerStats);
    } catch (error) {
      console.error("Error fetching player data: ", error);
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key == "Enter") {
      handleSearch();
    }
  };

  const statRedirect = () => {
    console.log("CLICKED");
    //console.log(playerData);
    //console.log(rankedData);

    router.push(`/stats?id=${playerData.brawlhalla_id}`);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search Player..."
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSearch}>Search!</button>
      <p>you typed {text}</p>
      {rankedData && playerData && (
        <div onClick={statRedirect} className={styles.playerCard}>
          <h1>{playerData.name}</h1>
          <h2>{rankedData.rating}</h2>
          <h3>{rankedData.wins / rankedData.games}</h3>
        </div>
      )}
    </div>
  );
};
//{rankedData && <pre>{JSON.stringify(rankedData, null, 2)}</pre>}
// {playerData && <pre>{JSON.stringify(playerData, null, 2)}</pre>}
export default PromptCard;
