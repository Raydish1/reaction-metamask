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
