/*Page that lets you sign in OR sign up, granting access to Favorites*/
import React, { useState, useEffect } from "react";
import {
  useSignInWithEmailAndPassword,
  useCreateUserWithEmailAndPassword,
} from "react-firebase-hooks/auth";
import { auth } from "../../backend/firebase";
import { useRouter } from "next/navigation";
import RootLayout from "../layout";
import { useStateContext } from "../../context/StateContext";
import styled from "styled-components";

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  font-family: Quicksand;
  min-width: 100vh;
  overflow-x: visible;
`;

const AuthBox = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
  margin: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 16px;
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: white;
  border: 2px solid lightgray;
  color: black;
  padding: 10px 25px;
  margin-left: 5px;
  height: 40px;
  text-align: center;
  display: inline-block;
  font-size: 16px;
  border-radius: 15px;
  font-family: Quicksand;
  box-shadow: rgba(121, 121, 121, 0.24) 0px 0px 7px;
  transition: 0.3s;

  &:hover {
    cursor: pointer;
    box-shadow: rgba(121, 121, 121, 0.24) 0px 0px 15px;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 0.5rem;
`;

const SigninSignup = () => {
  const { user, setUser } = useStateContext();
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signInWithEmailAndPassword, loggedInUser, loadingSignIn, errorSignIn] =
    useSignInWithEmailAndPassword(auth);
  const [
    createUserWithEmailAndPassword,
    createdUser,
    loadingSignup,
    errorSignup,
  ] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(signInEmail, signInPassword);
      if (res?.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(
        signUpEmail,
        signUpPassword
      );
      if (res?.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error("Sign-up error:", err);
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <RootLayout>
      <AuthContainer>
        <AuthBox>
          <h2>Log In</h2>
          <Form onSubmit={handleSignIn}>
            <Label>Email:</Label>
            <Input
              type="email"
              placeholder="Enter email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              required
            />
            <Label>Password:</Label>
            <Input
              type="password"
              placeholder="Enter password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loadingSignIn}>
              {loadingSignIn ? "Signing In..." : "Sign In"}
            </Button>
            {errorSignIn && <ErrorMessage>{errorSignIn.message}</ErrorMessage>}
          </Form>
        </AuthBox>

        <AuthBox>
          <h2>Sign Up</h2>
          <Form onSubmit={handleSignUp}>
            <Label>Email:</Label>
            <Input
              type="email"
              placeholder="Enter email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
            />
            <Label>Password:</Label>
            <Input
              type="password"
              placeholder="Enter password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loadingSignup}>
              {loadingSignup ? "Signing Up..." : "Sign Up"}
            </Button>
            {errorSignup && <ErrorMessage>{errorSignup.message}</ErrorMessage>}
          </Form>
        </AuthBox>
      </AuthContainer>
    </RootLayout>
  );
};

export default SigninSignup;
