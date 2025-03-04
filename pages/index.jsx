/*Home page, has main search player function*/

import RootLayout from "./layout";
import PromptCard from "../components/PromptCard";
import styled from "styled-components";
import Image from "next/image";

const Container = styled.section`
  overflow-x: hidden;
  position: relative;
  display: grid;
  place-items: center;
  min-width: 100vw;
  min-height: 100vh;
  font-family: Quicksand;
`;

const H1 = styled.h1`
  font-size: 200%;
`;

const BackgroundImage = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  width: stretch;
  height: 50%;
  object-fit: cover;
  opacity: 60%;
  z-index: -1;
`;

const TextSquare = styled.div`
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  background-color: rgb(255, 255, 255);
  padding: 20px;
  max-width: 95vw;

  min-width: 45%;
  height: 650px;
  border: 0px solid rgb(110, 110, 110);
  border-radius: 1px;
  text-align: center;
  z-index: 1;
  margin-top: 20px;
  margin-bottom: 20px;
`;
const Home = () => {
  return (
    <RootLayout>
      <Container>
        <BackgroundImage
          src="/bars.png"
          width={1930}
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
          <section>
            <H1>Brawlhalla Stats Bot</H1>
            <p>A website to find everything about your Brawlhalla stats</p>

            <PromptCard />
          </section>
        </TextSquare>
      </Container>
    </RootLayout>
  );
};

export default Home;
