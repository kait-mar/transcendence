import './navBar.css'
import { Link } from 'react-router-dom'

const NavBar = () => {
  return (
    <div className='pong_navbar'>
      <div className='pong_navbar-links'>
        <div className='pong_navbar-links_container'>
          {/* <Link to="/"><p><a className='homeLink' href='#home'>Home</a></p></Link>
          <Link to="/game"><p><a className='homeLink' href='#play'>Play</a></p></Link>
          <Link to="/Stream"><p><a className='homeLink' href='#stream'>Watch Live</a></p></Link>
          <Link to="/adminPanel"><p><a className='homeLink' href='#adminPanel'>Settings</a></p></Link>
          <p><a className='chatLink' href='#chat'>Chat</a></p> */}
        </div>
      </div>
    </div>
    
  )
}

export default NavBar