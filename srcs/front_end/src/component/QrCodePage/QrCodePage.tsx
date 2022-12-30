import NavBar from './navBar/NavBar'
import Footer from './footer/Footer'
import Login from './login/Login'
import { useEffect, useState } from 'react'
import Home from '../HomePage/Home';

function QrCodePage(log: any) {
 const [state, setState] = useState(log);
    useEffect(()=>{
        setState(log);
    }, [log])
    function comps  (log:boolean)
    {
        if (log=== false)
        {
            return   (<Home log= {log}/>)
        }
        else if (log === true)
        {
            return  (<div className='gradient__bg'>
                <NavBar />
                <Login />
                <Footer />
             </div>)
        }
    }
  return (
    <>
      {comps(state.log)}
    </> 
  )
}

export default QrCodePage