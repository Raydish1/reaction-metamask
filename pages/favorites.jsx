const { default: RootLayout } = require("./layout");

import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStateContext } from '../context/StateContext.js';

const Favorites = () => {
  const { user } = useStateContext(); // Get user from global state
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (user === null) {
      router.push("/sign-in");
    }
  }, [user, router]);

  if (user === undefined) return <p>Loading...</p>; // Show loading state while checking user

  return (
    <RootLayout>
      <div>Favorites</div>
    </RootLayout>
  );
};

export default Favorites;
