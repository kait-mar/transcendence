import {useEffect, useState} from 'react'
import { isAuthenticated} from '../../api/task.api'
import '../ConnectedPage/navBar/navBar.css'

export default function NavBar() {
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
  return (
    <div className='get-started-navbar'>
      <div className='pong_navbar-sign'>
        <img src={avatar} alt="avatar"  width="80" height="80" border-radius="50%"/>
      </div>
      <div className='pong_navbar-logout'>
        <button type='button' onClick={()=> (window.location.href= 'http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/logout')}>
          <p>logout</p>
        </button>
      </div>
    </div>
  )
}
