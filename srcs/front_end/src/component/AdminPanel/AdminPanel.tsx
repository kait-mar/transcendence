import { useState, useEffect } from 'react';
import { isAuthenticated, isLoggedIn } from '../../api/task.api';
// import './panel.css'
import axios from 'axios'
// import NavBar from './NavBar';
import NavBar from '../ConnectedPage/navBar/NavBar';
import Panel from './panel';
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom';

var socket: any;

export default function AdminPanel() {

  const navigate = useNavigate()

  useEffect(() => {
     isLoggedIn().catch(() => {
      navigate('/connected');
    })
    socket = io('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/status');
    return () => {
      if (socket)
        socket.emit('_disconnect'); 
    }
  }, [])

  useEffect(() => {
    axios.get('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/get-user', {
      withCredentials:true}).then(async({data}) => {
          socket.emit('user_connected', {user: data.user.nickName, status: 'online'});
      })
  }, [])

  return (
    <div className='gradient__bg'>
        <NavBar/>
        <Panel/>
    </div>

  );
}

