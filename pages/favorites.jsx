const { default: RootLayout } = require("./layout");

import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStateContext } from "../context/StateContext.js";

const Favorites = () => {
  const { user } = useStateContext();
  const router = useRouter();

  // redirect unauthenticated users
  useEffect(() => {
    if (user === null) {
      router.push("/sign-in");
    }
  }, [user, router]);

  if (user === undefined) return <p>Loading...</p>; // show loading state while checking user

  return (
    <RootLayout>
      <div>Favorites</div>
    </RootLayout>
  );
};

export default Favorites;
