
//button that allows user to favorite/unfavorite a player
// if user not signed in, grayed out style
//if already in user database, show already favorited style with red on hover
// if signed in and want to favorite, write it into the firestore

import styled from "styled-components";
import { useStateContext } from "../context/StateContext";
import { useState, useEffect } from "react";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { app } from "../backend/firebase";
import Image from "next/image";
import { db } from "../backend/firebase";

const StyledButton = styled.div`
  
  color: white;
  padding-left:10px;
  padding-right:5px;

  border: none;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover {
    
  }
`;

const FavoriteButton = ({ rankedData, playerId, legend }) => {
  const  {user}= useStateContext();
  const [isFavorited, setIsFavorited] = useState(false);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFavorite = async () => {
      if (user && playerId) {
        const favoriteDocRef = doc(db, "favorites", `${user.uid}_${playerId}`);
        const docSnap = await getDoc(favoriteDocRef);
        setIsFavorited(docSnap.exists());
      } else {
        setIsFavorited(false);
      }
      setLoading(false);
    };

    checkFavorite();
  }, [user, playerId, db]);

  const handleFavorite = async () => {
    if (user && playerId) {
      const favoriteDocRef = doc(db, "favorites", `${user.uid}_${playerId}`);
      if (isFavorited) {
        await deleteDoc(favoriteDocRef);
        setIsFavorited(false);
      } else {
        await setDoc(favoriteDocRef, {
          userId: user.uid,
          playerId: playerId,
          name:rankedData.name,
          rating: rankedData.rating,
          rank: rankedData.tier,
          bestLegend: legend,
          wins: rankedData.wins,
          games: rankedData.games,
          rankedData: rankedData,
        });
        setIsFavorited(true);
      }
    } else {
      alert("Please log in to favorite players.");
    }
  };

  return (
    <StyledButton
      isFavorited={isFavorited}
      disabled={!user}
      onClick={(e) => {
        handleFavorite(e); 
        e.stopPropagation(); // doesnt redirect to stats on click in dropdown
      }}
    >
        {isFavorited ? (
        <Image src="/filled-star.png" width={30} height={30} alt="Favorited" />
      ) : (
        <Image src="/favorite.png" width={30} height={30} alt="Favorite" />
      )}
      
    </StyledButton>
  );
};





export default FavoriteButton;