import RootLayout from "./layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useStateContext } from "../context/StateContext.js";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../backend/firebase"; 
import styled from "styled-components";
import FavoriteButton from "../components/FavoriteButton";
import Image from "next/image"


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

const Container = styled.div`
background-image: url('/triangle-background.png');
  min-height: 100vh; 
  overflow-y: hidden; 
  background-size: cover; 
  background-repeat: no-repeat; 
  text-align:center;
`;

const Header = styled.h2`
  font-size:50px;
`;


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
      <Container>
      <FavoritesContainer>
        <Header>Your Favorites</Header>
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            
            <FavoriteRow key={favorite.id} onClick={() => router.push(`/stats?id=${favorite.playerId}&legend=${favorite.bestLegend}`)}>
              
              <SmallP>{favorite.rating}</SmallP>
              <Image
                src={`/ranks/${favorite.rank}.webp`}
                width={50}
                height={50}
                alt={favorite.tier}
                style={{ marginRight: "10px" }}
              />
              <Image
                src={`/legends/${favorite.bestLegend}.png`}
                width={50}
                height={50}
                alt={favorite.bestLegend}
                style={{ marginRight: "10px" }}
              />
              {favorite.name}
              <WLContainer>
                    W/L: {favorite.wins}-{favorite.games - favorite.wins}
              </WLContainer>
              <FavoriteButton
            rankedData={favorite.rankedData}
            playerId={favorite.playerId}
            legend={favorite.bestLegend}
            onClick={(e) => e.stopPropagation()}
          />
              
            </FavoriteRow>
          ))
        ) : (
          <p>You have no favorites yet.</p>
        )}
      </FavoritesContainer>
      </Container>
    </RootLayout>
  );
};

const FavoritesContainer = styled.div`
  padding: 20px;
  font-family:Quicksand;
  width:50%;
  margin: 0 auto;
`;

const FavoriteRow = styled.div`
  display: flex; 
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: -1px;
  font-size:150%;
  background:white;
  align-items: center;
  
  &:nth-child(odd) {
    background: rgb(247, 247, 247);
  }
`;

export default Favorites;