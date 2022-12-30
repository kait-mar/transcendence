import {useEffect, useState} from 'react'
import './navBar.css'
import { isAuthenticated } from '../../../api/task.api'
import 'antd/dist/antd.min.css'
import Image from '../../Image/Image'

const NavBar = () => {
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    useEffect(() =>{
        isAuthenticated()
        .then(({data}) => {
          setAvatar(data.avatar);
          setName(data.nickName);
        })
    },[avatar, name])
    
  return (
    <div className='pong_navbar'>
      <div className='pong_navbar-proName'>
        <p >{name}</p>
      </div>
      <div className='pong_navbar-sign'>
         < Image url= {avatar}  alt='profil' /> 
      </div>
      <div className="pong_navbar-enable">
      </div>
    </div>
    
  )
}

export default NavBar