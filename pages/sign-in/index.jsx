import React, { useState, useEffect} from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../../backend/firebase";
import { useRouter } from "next/navigation";
import RootLayout from "../layout";
import { useStateContext } from "../../context/StateContext";

const Signin = () => {
  const { user, setUser } = useStateContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithEmailAndPassword, loggedInUser, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload

    try {
      const res = await signInWithEmailAndPassword(email, password);
      setEmail("");
      setPassword("");
      if (res?.user) {
        setUser(res.user); // Update global user state
      }
    } catch (err) {
      console.error("Sign-in error:", err);
    }
  };
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <RootLayout>
      <form onSubmit={handleSubmit}>
        <h2>Sign In</h2>

        <label>Email:</label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {error && <p style={{ color: "red" }}>{error.message}</p>}
      </form>
    </RootLayout>
  );
};

export default Signin;
