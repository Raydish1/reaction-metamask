import { StateContext } from '../context/StateContext.js' 
import React from "react";


function MyApp({ Component, pageProps }) {
  return (<>
  
    <StateContext>
        
      <Component {...pageProps} />
    </StateContext></>
  );
}

export default MyApp;