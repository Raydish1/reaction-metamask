import { StateContext } from '../context/StateContext.js' // Adjust path if needed
import Head from "next/head";
import React from "react";


function MyApp({ Component, pageProps }) {
  return (<>
  
    <StateContext>
        
      <Component {...pageProps} />
    </StateContext></>
  );
}

export default MyApp;