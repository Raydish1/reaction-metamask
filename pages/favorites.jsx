import RootLayout from "./layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useStateContext } from "../context/StateContext.js";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../backend/firebase"; 
import styled from "styled-components";

const Favorites = () => {
  const { user } = useStateContext();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const db = getFirestore(app);

  // redirect unauthenticated users
  useEffect(() => {
    if (user === null) {
      router.push("/sign-in");
    }
  }, [user, router]);

  // get favorites from Firestore
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const favoritesCollection = collection(db, "favorites");
        const q = query(favoritesCollection, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedFavorites = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(fetchedFavorites);
      }
    };

    fetchFavorites();
  }, [user, db]);

  if (user === undefined) return <p>Loading...</p>; // show loading state while checking user

  return (
    <RootLayout>
      <FavoritesContainer>
        <h2>Your Favorites</h2>
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <FavoriteRow key={favorite.id} onClick={() => router.push(`/stats?id=${favorite.playerId}&legend=${favorite.bestLegend}`)}>
              <p>#{favorite.playerId} - {favorite.name} - {favorite.best_lengend} - {favorite.rank} - {favorite.rating} - {favorite.wins}/{favorite.games-favorite.wins}</p>
              
            </FavoriteRow>
          ))
        ) : (
          <p>You have no favorites yet.</p>
        )}
      </FavoritesContainer>
    </RootLayout>
  );
};

const FavoritesContainer = styled.div`
  padding: 20px;
  font-family:Quicksand;
`;

const FavoriteRow = styled.div`
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
`;

export default Favorites;