import NavBar from './navBar/NavBar'
import Footer from './footer/Footer'
import Login from './login/Login'
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom';

function LoginPage(log:any) {
    const [state, setState] = useState(log);
    useEffect(()=>{
        setState(log);
    }, [log])
    function comps  (log:boolean)
    {
        if (log === false)
        {
            return (
             <div className='gradient__bg'>
                <NavBar />
                <Login />
                {/* <Footer />   */}
              </div>
            )
        }
        else if (log === true)
        {
            return  (<Navigate to ="/connected" />)
        }
    }
  return (
    <>
      {comps(state.log)}
    </>
  )
}

export default LoginPage