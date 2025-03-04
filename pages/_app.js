import { StateContext } from '../context/StateContext.js' 
import React from "react";


function MyApp({ Component, pageProps }) {
  return (<div style={{ minWidth: "100vw" }}>
  
    <StateContext>
        
      <Component {...pageProps} />
    </StateContext></div>
  );
}

export default MyApp;