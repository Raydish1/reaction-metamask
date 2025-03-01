import RootLayout from "./layout";
import PromptCard from "../components/PromptCard";
import styled from "styled-components";
import Image from "next/image";
const myStyle = {
  fontFamily: "Quicksand",
  textSize: "150px",
  textAlign: "center",
};

const styledSection = styled.section`
  font-family: "Quicksand",
  text-size:"150px",
  text-align: "center",
`;

const Container = styled.section`
  overflow-x: hidden;
`;

const TextSquare = styled.div`
  position: absolute;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  top: 50%; // Center vertically
  left: 50%; // Center horizontally
  transform: translate(-50%, -50%); // Adjust for centering
  background-color: rgb(255, 255, 255);
  padding: 20px;
  width: 750px;
  height: 540px;
  padding-bottom: 100px;
  border: 0px solid rgb(110, 110, 110);
  border-radius: 1px; // Optional: Rounded corners
  text-align: center;
`;
const Home = () => {
  return (
    <RootLayout>
      <Container>
        <Image
          src="/bars.png"
          width={1910}
          height={400}
          alt="Background Bars"
          quality={100}
          style={{ opacity: "60%" }}
        />

        <TextSquare>
          <Image
            src="/legends/cross.png"
            width={210}
            height={210}
            alt="bodvar"
            quality={100}
          />
          <section style={myStyle}>
            <h1>Brawlhalla Stats Bot</h1>
            <p>A website to find everything about your Brawlhalla stats</p>

            <PromptCard />
          </section>
        </TextSquare>
      </Container>
    </RootLayout>
  );
};

export default Home;
