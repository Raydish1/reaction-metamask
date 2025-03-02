import { useState } from "react";
import { searchPlayer } from "../pages/api/brawlhalla.js";
import { searchByName } from "../pages/api/brawlhalla.js";
import { useRouter } from "next/router";
import Image from "next/image";
import FavoriteButton from ".//FavoriteButton";

import styled from "styled-components";

const legendToID = {
  3: "bodvar",
  4: "cassidy",
  5: "orion",
  6: "vraxx",
  14: "ada",
  11: "roland",
  10: "hattori",
  15: "sentinel",
  12: "scarlet",
  7: "gnash",
  8: "nai",
  9: "lucien",
  13: "thatch",
  30: "val",
  31: "ragnir",
  29: "shang",
  20: "asuri",
  25: "diana",
  24: "koji",
  26: "jhala",
  17: "raptor",
  18: "ember",
  21: "barraza",
  28: "kor",
  19: "brynn",
  16: "teros",
  22: "ulgrim",
  23: "azoth",
  27: "loki",
  52: "volkov",
  44: "fei",
  49: "thor",
  41: "isaiah",
  34: "nix",
  40: "xull",
  53: "onyx",
  33: "mirage",
  57: "reno",
  45: "zariel",
  56: "magyar",
  47: "dusk",
  32: "cross",
  37: "artemis",
  43: "jiro",
  54: "jaeyun",
  58: "munin",
  48: "fait",
  55: "mako",
  35: "mordex",
  36: "yumiko",
  50: "petra",
  39: "sidra",
  46: "rayman",
  51: "vector",
  59: "arcadia",
  42: "kaya",
  63: "tezca",
  38: "caspian",
  62: "thea",
  64: "vivi",
  61: "seven",
  65: "imugi",
  66: "zuva",
  67: "priya",
};

const PlayerCard = styled.div`
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  width: 300px;
  height: 200px;
  cursor: pointer;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: top;
  font-family:Quicksand;
`;

const InputBox1 = styled.input`
  height: 35px;
  width: 600px;
  border: 1px solid #ccc;
  border-radius: 15px;
  padding: 0 15px;
  font-size: 16px;
  font-family: Quicksand;
`;

const InputBox2 = styled.input`
  height: 35px;
  width: 600px;
  border: 0px solid #fff;
  //border-bottom: 1px solid black;
  outline: none;
  padding-left: 10px;
  padding: 0 15px;
  font-size: 16px;
  font-family: Quicksand;
`;

const Button = styled.button`
  background-color: white;
  border: 1px solid lightgray;
  color: black;
  padding: 10px 25px;
  margin-left: 5px;
  height: 40px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-radius: 15px;
  font-family:Quicksand;
  box-shadow: rgba(121, 121, 121, 0.24) 0px 2px 5px;
  transition:0.3s;

  &:hover{
  cursor:pointer;
  box-shadow: rgba(121, 121, 121, 0.24) 0px 2px 10px;
  }
`;

const Dropdown = styled.div`
  background-color: white;
  border: 1px solid #ccc;
  width: 630px;
  border-radius: 15px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  margin: 0px;
`;

const DropdownItem = styled.div`
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const SmallP = styled.div`
  width: 36px;
  opacity: 60%;
  font-size: 10px;
  margin-right: 5px;
  align-items: vertical;
`;

const WLContainer = styled.div`
  margin-left: auto;
`;

const Hr = styled.hr`

  border: 1px solid lightgray; /* Customize color and thickness */
  width: 95%; /* Adjust width */
  margin: 3px auto; /* Center and add spacing */
  opacity:40%;
  

`;

const PromptCard = () => {
  const [text, setText] = useState(""); //Text box input
  const [underText, setUnderText] = useState("");
  const [rankedData, setRankedData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const router = useRouter();

  const handleChange = (e) => {
    setText(e.target.value); //When you type in the input box, it changes the text
  };

  const handleSearch = async () => {
    try {
      const data = await searchByName(text); //Calls searchPlayer function from api file
      console.log("searched data");
      console.log(data);
      if (data && data.length > 0) {
        setUnderText("");

        const sortedResults = data.sort((a, b) => {
          //ex. if searched "ray", show players named exactly "ray" first
          if (a.name.toLowerCase() === text.toLowerCase()) {
            return -1; // element a comes first
          } else if (b.name.toLowerCase() === text.toLowerCase()) {
            return 1; // element b comes first
          } else {
            return 0; // No change in order
          }
        });
        setSearchResults(sortedResults.slice(0, 5)); }

        //setSearchResults(data);
        //setRankedData(data.rankedStats);
        //setPlayerData(data.playerStats);}
        if (data.length === 0) {
          setSearchResults([]);
        setRankedData(null);
        setPlayerData(null);
        setUnderText("Player must exist and have completed placement matches.");
        }
      
      }
     catch (error) {
      console.error("Error fetching player data: ", error);
    }
  };

  const handlePlayerSelect = async (player) => {
    try {
      router.push(`/stats?id=${player.brawlhalla_id}&legend=${legendToID[player.best_legend]}`);
      setSearchResults([]);
      setText("")
    } catch (error) {
      console.error("Error fetching player data: ", error);
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key == "Enter") {
      handleSearch();
    }
  };



  return (
    <div>
      <SearchContainer>
        {searchResults.length > 0 ? (
          <>
            <Dropdown>
              <InputBox2
                type="text"
                placeholder="Search Player..."
                value={text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              /><Hr />

              {searchResults.map((player) => (
                <DropdownItem
                  key={player.brawlhalla_id}
                  onClick={() => handlePlayerSelect(player)}
                >
                  <SmallP>#{player.rank} / {player.rating}</SmallP>
                  <Image
                    src={`/ranks/${player.tier}.webp`}
                    width={30}
                    height={30}
                    alt={player.tier}
                    style={{ marginRight: "10px" }}
                  />
                  <Image
                    src={`/legends/${legendToID[player.best_legend]}.png`}
                    width={30}
                    height={30}
                    alt={legendToID[player.best_legend]}
                    style={{ marginRight: "10px" }}
                  />
                  {player.name}
                  <WLContainer>
                    W/L: {player.wins}-{player.games - player.wins}
                  </WLContainer>
                  <FavoriteButton
            rankedData={player}
            playerId={player.brawlhalla_id}
            legend={legendToID[player.best_legend]}
            onClick={(e) => e.stopPropagation()}
          />
                </DropdownItem>
              ))}
            </Dropdown>
            <Button onClick={handleSearch}>Search!</Button>
          </>
        ) : (
          <div>
            <InputBox1
              type="text"
              placeholder="Search Player..."
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleSearch}>Search!</Button>
          </div>
        )}
      </SearchContainer>
      <p>{underText}</p>
    </div>
  );
};

export default PromptCard;
