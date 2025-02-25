import RootLayout from "./layout";
import PromptCard from "../components/PromptCard";

const myStyle = {
  fontFamily: "Arial",
  textAlign: "center",
};

const Home = () => {
  return (
    <RootLayout>
      <section style={myStyle}>
        <h1>Brawlhalla Stats Bot</h1>
        <p>A website to find everything about your Brawlhalla stats</p>

        <PromptCard />
      </section>
    </RootLayout>
  );
};

export default Home;
