
//RANKINGS https://api.brawlhalla.com/rankings/{bracket}/{region}/{page}?name={name}?api_key=   
//STATS https://api.brawlhalla.com/player/{brawlhalla_id}/stats
//RANKED STATS https://api.brawlhalla.com/player/{brawlhalla_id}/ranked
//CLAN STATS https://api.brawlhalla.com/clan/{clan_id}


const BASE_URL = "https://api.brawlhalla.com";
const apiKey = process.env.NEXT_PUBLIC_BRAWLHALLA_API_KEY; // Ensure this is set in .env.local

export async function searchByName(name) {
  try {
    const response = await fetch(`${BASE_URL}/rankings/1v1/us-e/1?name=${name}&api_key=${apiKey}`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
      const stats = await response.json();
      console.log(stats)
      if (stats[0]) {
        return searchPlayer(stats[0].brawlhalla_id);
      }
      else {
        return null
      }
      
      const brawlhalla_id = stats.brawlhalla_id;
      // console.log("before")
      // console.log(brawlhalla_id)
      // searchPlayer(brawlhalla_id)
    
  } catch (error) {
    console.error("Error fetching player data:", error)
    return null;
  }
}

export async function searchPlayer(brawlhalla_id) {
  try {
    const response = await fetch(`${BASE_URL}/player/${brawlhalla_id}/ranked?api_key=${apiKey}`);
    const response2 = await fetch (`${BASE_URL}/player/${brawlhalla_id}/stats?api_key=${apiKey}`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    if (!response2.ok) {
        throw new Error(`HTTP error! Status: ${response2.status}`);
      }
    const playerStats = await response2.json();
    const rankedStats = await response.json();


    return {rankedStats, playerStats}; // Return the fetched data
  } catch (error) {
    console.error("Error fetching player data:", error);
    return null; // Return null if an error occurs
  }
}

export async function getRankings(bracket, region, page) {
  try {
    const response = await fetch (`${BASE_URL}/rankings/${bracket}/${region}/${page}?api_key=${apiKey}`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const rankings = await response.json();
      return rankings;
  }catch (error) {
    console.error("Error fetching rankings: ", error)
    return null;
  }
}

