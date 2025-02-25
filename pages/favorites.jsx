const { default: RootLayout } = require("./layout");
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "/pages/firebase/config";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Favorites = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-up");
    }
  }, [user, loading, router]);

  if (typeof window === "undefined") return null;
  /* In Node.js (server-side), window does not exist.
  In the browser (client-side), window exists.
  Since useRouter() only works on the client, checking typeof window ensures the code only runs in the browser.
  
  If the code is running on the server, the component does not render (return null).
  Once the page loads on the client, the component will mount properly.*/

  return (
    <RootLayout>
      <div>Favorites</div>
    </RootLayout>
  );
};

export default Favorites;
