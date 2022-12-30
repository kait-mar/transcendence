import React from 'react'
import './navBar.css'
import { Link } from 'react-router-dom'

const NavBar = () => {
  return (
    <div className='pong_navbar'>
      <div className='pong_navbar-links'>
        <div className='pong_navbar-links_container'>
          <Link to="/"><p><a className='homeLink' href='#home'>Home</a></p></Link>
        </div>
      </div>
      {/* <div className='pong_navbar-sign'>
        <p className='signIn'>Sign in</p>
        <button type='button'>Sign up</button>
      </div> */}
    </div>
    
  )
}

export default NavBar