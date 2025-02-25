import Link from "next/link";
import { auth } from "/pages/firebase/config";
import { signOut } from "firebase/auth";

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

        <Link href="/sign-in" style={myStyle}>
          Login
        </Link>

        <Link href="/sign-up" style={myStyle}>
          Sign Up
        </Link>

        <button onClick={() => signOut(auth)}>Log Out</button>
      </nav>
    </div>
  );
};

export default Nav;
