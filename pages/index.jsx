import RootLayout from "./layout";
import PromptCard from "../components/PromptCard";
import styled from "styled-components";
import Image from 'next/image'
const myStyle = {
  fontFamily: "Quicksand",
  textSize:"150px",
  textAlign: "center",
};

const styledSection = styled.section`
  font-family: "Quicksand",
  text-size:"150px",
  text-align: "center",
`;

const TextSquare = styled.div`
  position: absolute;
  top: 50%; // Center vertically
  left: 50%; // Center horizontally
  transform: translate(-50%, -50%); // Adjust for centering
  background-color: white;
  padding: 20px;
  padding-bottom:300px;
  border: 2px solid rgb(110, 110, 110);
  border-radius: 1px; // Optional: Rounded corners
  text-align: center;
`;
const Home = () => {
  return (
    <RootLayout>
      
        <Image src="/bars.png" width={1910} height={400} alt="Background Bars" quality={100} style={{opacity:"60%"}}/>
      
      <TextSquare>
      <section style={myStyle}>
        <h1>Brawlhalla Stats Bot</h1>
        <p>A website to find everything about your Brawlhalla stats</p>

        <PromptCard />
      </section></TextSquare>
    </RootLayout>
  );
};

export default Home;
