import { useState } from "react";
import RootLayout from "./layout";
import { useEffect } from "react";
import { getRankings } from "./api/brawlhalla.js";

export default function Rankings() {
  const [displayedRankings, setDisplayedRankings] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const data = await getRankings("1v1", "us-e", "1");
      setDisplayedRankings(data);
    };
    getData();
  }, []);
  return (
    <RootLayout>
      <h1>Rankings</h1>
      {displayedRankings && (
        <pre>{JSON.stringify(displayedRankings, null, 2)}</pre>
      )}
    </RootLayout>
  );
}
