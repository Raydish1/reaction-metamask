import { StateContext } from '../context/StateContext.js' // Adjust path if needed


function MyApp({ Component, pageProps }) {
  return (
    <StateContext>
      <Component {...pageProps} />
    </StateContext>
  );
}

export default MyApp;