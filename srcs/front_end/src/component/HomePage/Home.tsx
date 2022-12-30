import {NavBar, Footer, Header} from '..';

import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom';

function Home(log:any) {

    const [state, setState] = useState(log);
    useEffect(()=>{
        setState(log);
    }, [log])
    function comps  (log:boolean)
    {
        if (log=== false)
        {
            return   (
            <div className='gradient__bg'>
              <NavBar />
              <Header />
              {/* <Footer />   */}
            </div>
            )
        }
        else if (log === true)
        {
            return  (<Navigate to= "/connected" />)
        }
        }
  return (
    <>
      {comps(log.log)}
    </> 
  )
}

export default Home