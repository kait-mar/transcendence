import React from 'react'
import Live from './Live'
import NavBar from '../ConnectedPage/navBar/NavBar'
import { useEffect} from 'react';
import { io } from 'socket.io-client'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../../api/task.api';

var status_socket: any

export default function Stream() {

  const navigate = useNavigate()
  useEffect(() => {
    isLoggedIn().catch(() => {
      navigate('/connected');
    })
    status_socket = io('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/status');
    return () => {
      if (status_socket)
        status_socket.emit('_disconnect'); 
    }
  }, [])

  useEffect(() => {
    axios.get('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/get-user', {
      withCredentials:true}).then(async({data}) => {
          status_socket.emit('user_connected', {user: data.user.nickName, status: 'online'});
      })
  }, [])

  return (
    <div className='gradient__bg'>
        <NavBar/>
        <Live/>
    </div>
  )
}
