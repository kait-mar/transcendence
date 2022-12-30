
import { useEffect, useState } from 'react'
import './dashboard.css'
import Sidebar from './SideBar/Sidebar';
import MainDash from './MainDash/MainDash';
import RightSide from './RightSide/RightSide';
import Home from '../HomePage/Home';

const DashboardPageProfile = (log:any) => {
  const [state, setState] = useState(log);

  useEffect(()=>{
      setState(log);
  },[log])
  
  function comps  (log:boolean)
  {
      if (log=== true)
      {
          return (
             <div className='Apps'>
               <div className='AppGlass'>
                 <Sidebar />
                 <MainDash/>
                 <RightSide  />
               </div>
             </div> 
            );
      }
      else if (log === false)
      {
          return   (<Home log = {log}/>)
      }
  }
   return (
    <>
    {comps(state.log)}
    </>
   )
}
export default DashboardPageProfile;

