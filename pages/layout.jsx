/*export const metadata = {
    title: "Raydish Bot",
    description: 'Discover Brawlhala'
}*/

import Nav from "../components/Nav";



const RootLayout = ({ children }) => {
  return (
    <div>
      <main className="app">
        <Nav />
        {children}
      </main>
    </div>
  );
};

export default RootLayout;
