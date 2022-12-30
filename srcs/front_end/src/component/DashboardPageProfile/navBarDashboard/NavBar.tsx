import {useEffect, useState} from 'react'
import './navBar.css'
import { isAuthenticated, getQrcode } from '../../../api/task.api'
import 'antd/dist/antd.min.css'

const NavBar = () => {
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    useEffect(() =>{
        isAuthenticated()
        .then(({data}) => {
          setAvatar(data.avatar);
          setName(data.nickName);
        })
        .catch((err) => console.error(err));
    },[avatar])
  return (
    <div className='pong_navbar'>
      <div className='pong_navbar-proName'>
        <p >{name}</p>
      </div>
      <div className='pong_navbar-sign'>
         < img src= {avatar}  alt='profil' width="80" height="80" border-radius="50%"/> 
      </div>
      <div className="pong_navbar-enable">
      </div>
    </div>
    
  )
}

export default NavBar