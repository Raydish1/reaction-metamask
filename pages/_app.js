import { StateContext } from '../context/StateContext.js' // Adjust path if needed
import Head from "next/head";
import React from "react";
import { GlobalStyles } from "../styles/GlobalStyles";

function MyApp({ Component, pageProps }) {
  return (<>
  <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </Head>
    <StateContext>
        <GlobalStyles />
      <Component {...pageProps} />
    </StateContext></>
  );
}

export default MyApp;