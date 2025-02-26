import Link from "next/link";
import { auth } from "../backend/firebase.js";
import { signOut } from "firebase/auth";
import { useStateContext } from "../context/StateContext";


const myStyle = {
  fontFamily: "Recursive Sans Linear Light, sans-serif",
  margin: "5px",
  //textAlign: "center",
};



const navStyle = {
  padding: "10px",
  backgroundColor: "white",
  border: "2px",
};

const Nav = () => {
  const { user } = useStateContext();

  let authButtons; // store buttons based on auth state

  if (user) {
    // If user is logged in only show log out button
    authButtons = (
      <button
        onClick={() => signOut(auth)}
        style={{ marginLeft: "10px", cursor: "pointer" }}
      >
        Log Out
      </button>
    );
  } else {
    //if not logged in, show log in/sign up
    authButtons = (
      <>
        <Link href="/sign-in" style={myStyle}>
          Login
        </Link>

        <Link href="/sign-up" style={myStyle}>
          Sign Up
        </Link>
      </>
    );
  }

  return (
    <div style={navStyle}>
      <nav>
        <Link href="/" style={myStyle}>
          Home
        </Link>

        <Link href="/rankings" style={myStyle}>
          Rankings
        </Link>

        <Link href="/stats" style={myStyle}>
          Stats
        </Link>

        <Link href="/favorites" style={myStyle}>
          Favorites
        </Link>

        <Link href="/clans" style={myStyle}>
          Clans
        </Link>

        {authButtons}
      </nav>
    </div>
  );
};

export default Nav;
