import React, {useEffect, useState} from 'react'
import './navBar.css'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { isAuthenticated, getQrcode } from '../../../api/task.api'
import { Switch } from 'antd'
import 'antd/dist/antd.min.css'
import { Buffer } from 'buffer'
import {Login } from '../../QrCodePage/login/Login'
// import userEvent from '@testing-library/user-event'
import QrCodePage from '../../QrCodePage/QrCodePage'
import { couldStartTrivia, JsxElement } from 'typescript'
import axios from 'axios'
import Image from '../../Image/Image'

const NavBar = () => {
  const navigate = useNavigate()
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [qrCode, setQrcode] = useState('');
    const [toggle, setToggle] = useState(Boolean);
    useEffect(() =>{
        isAuthenticated()
        .then(({data}) => {
          setAvatar(data.avatar);
          setName(data.login);
          setToggle(data.isTwoFactoAuthenticationEnabled)
        })
        .catch((err) => console.error(err));
    },[avatar, qrCode, toggle])
    const toggler = ()=> {
      toggle ? setToggle(false) : setToggle(true);
    } 
    const allIn = (event:any, qr: String) => {
      if (toggle === false)
      {
        navigate("/qrCode");
      }
      else if (toggle === true)
      {
        axios.get("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/auth/turn-off",{
          withCredentials: true,
        });
      }
    }
  return (
    <div className='pong_navbar'>
      <div className='pong_navbar-links'>
        <div className='pong_navbar-links_container'>
          <Link to="/"><p><a className='homeLink' href='#home'>Home</a></p></Link>
          <Link to="/game"><p><a className='homeLink' href='#play'>Play</a></p></Link>
          <Link to="/Stream"><p><a className='homeLink' href='#stream'>Watch Live</a></p></Link>
          <Link to="/adminPanel"><p><a className='homeLink' href='#adminPanel'>Settings</a></p></Link>
          <p><a className='chatLink' href='#chat'>Chat</a></p>
            <Switch   onClick={event => allIn(event, qrCode)} />
        </div>
      </div>
      <div className='pong_navbar-proName'>
        <p >{name}</p>
      </div>
      <div className='pong_navbar-sign'>
         < Image url= {avatar}  alt='profil' /> 
      </div>
      <div className="pong_navbar-enable">
      </div>
      <div className='pong_navbar-logout'>
        <button type='button' onClick={()=> (window.location.href= 'http://'+process.env.REACT_APP_IP_ADDRESS+':3000/auth/logout')}>
          <p>logout</p>
        </button>
      </div>
    </div>
    
  )
}

export default NavBar