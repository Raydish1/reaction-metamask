import { useState } from "react";
import { searchPlayer } from "../pages/api/brawlhalla.js";
import { searchByName } from "../pages/api/brawlhalla.js";
import { useRouter } from "next/router";
import styles from "./PromptCard.module.css";

const PromptCard = () => {
  const [text, setText] = useState(""); //Text box input
  const [underText, setUnderText] = useState("");
  const [rankedData, setRankedData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setText(e.target.value); //When you type in the input box, it changes the text
  };

  const handleSearch = async () => {
    try {
      const data = await searchByName(text); //Calls searchPlayer function from api file
      console.log("searched data");
      console.log(data);
      if (data) {
        setUnderText("");
        setRankedData(data.rankedStats);
        setPlayerData(data.playerStats);
      } else {
        setUnderText("Player must exist and have completed placement matches.");
      }
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
    //console.log("CLICKED");
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
        className={styles.inputBox}
      />
      <button onClick={handleSearch} className={styles.button}>
        Search!
      </button>
      <p>{underText}</p>
      {rankedData && playerData && (
        <div onClick={statRedirect} className={styles.playerCard}>
          <h1>{playerData.name}</h1>
          <h2>{rankedData.rating}</h2>
          <h3>{Math.round((rankedData.wins / rankedData.games) * 100)}% W/L</h3>
          <p>{}</p>
        </div>
      )}
    </div>
  );
};
//{rankedData && <pre>{JSON.stringify(rankedData, null, 2)}</pre>}
// {playerData && <pre>{JSON.stringify(playerData, null, 2)}</pre>}
export default PromptCard;
