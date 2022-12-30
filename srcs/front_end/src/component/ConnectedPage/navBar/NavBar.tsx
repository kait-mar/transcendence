import {useEffect, useState} from 'react'
import './navBar.css'
import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../../../api/task.api'
import { Switch } from 'antd'
import 'antd/dist/antd.min.css'
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
          setName(data.nickName);
          setToggle(data.isTwoFactoAuthenticationEnabled)
        })
    },[avatar, qrCode, toggle, name])
    const toggler = ()=> {
      toggle ? setToggle(false) : setToggle(true);
    } 
    const allIn = async (event:any, qr: String) => {
      if (event === true)
        navigate("/qrCode");
      else if (event === false)
      {
        await axios.get("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/auth/turn-off",{
          withCredentials: true,
        }).then(res => {
        setToggle(false);
      })
      }
    }
  return (
    <div className='pong_navbar'>
      <div className='pong_navbar-links'>
        <div className='pong_navbar-links_container'>
          <Link to="/"><p><a className='homeLink' href='#home'>Home</a></p></Link>
          <Link to="/chat"><p><a className='homeLink' href='#play'>Chat</a></p></Link>
          <Link to="/game"><p><a className='homeLink' href='#play'>Play</a></p></Link>
          <Link to="/Stream"><p><a className='homeLink' href='#stream'>Watch Live</a></p></Link>
          <Link to="/adminPanel"><p><a className='homeLink' href='#adminPanel'>Settings</a></p></Link>
          <Link to="/user/admin"><p><a className='homeLink' href='#home'>Dashboard</a></p></Link>
            <Switch  checked={toggle} onClick={event => allIn(event, qrCode)} />
        </div>
      </div>
      <div className='pong_navbar-proName'>
        <p >{name}</p>
      </div>
      <div className='pong_navbar-sign'>
         < Image url= {avatar}  alt='profil' /> 
         {/* < img src={avatar} alt='profil' width="80" height="80" border-radius="50%"/> */}
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