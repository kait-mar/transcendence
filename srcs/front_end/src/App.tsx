import React, { useEffect, useState } from 'react';
import Chat from './component/ChatFrontEnd/Chat';
import {ConnectedPage, DashboardPage, Home, LoginPage, QrCodePage} from './component'
import './App.css'
import {Routes, Route} from 'react-router-dom'
import { isLoggedIn} from './api/task.api';
import DashboardPageProfile from './component/DashboardPageProfile/DashboardPage';
import AdminPanel from './component/AdminPanel/AdminPanel';
import Game from './component/game/Game';
import Stream from './component/stream/Stream';
import GetStarted from './component/GetStarted/GetStarted';


function App() {
console.log = console.warn = console.error = () => {};
 const  [loggedIn, setLoggedIn] = useState(false);

  
    useEffect (() => {
        isLoggedIn().then(async({data}) => {
        setLoggedIn(data.loggedOn);
    }) }, [])

  return (
    <div className='App'>
      <Routes>
        <Route path='/' element= {<Home log ={loggedIn} />}  />
        <Route path='/login' element= {<LoginPage log ={loggedIn}/>} />
        <Route path='/qrCode' element={<QrCodePage log = {loggedIn}/>} />
        <Route element= {<ConnectedPage log={loggedIn} />} path='/connected' /> 
        <Route element={ < DashboardPage log={loggedIn}  />}  path='/user/admin' />
        <Route element={ < DashboardPageProfile log={loggedIn}  />}  path='/user/:userId' />
        <Route element= {<AdminPanel/>}  path='/adminPanel' />
        <Route element = {<Game/>} path='/game' />
        <Route element = {<Stream/>} path='/stream' />
        <Route element = {<GetStarted/>} path='/getStarted' />
        <Route element={< Chat log={loggedIn}/>} path='/chat' />

      </Routes>
    </div>
  )
}

export default App
