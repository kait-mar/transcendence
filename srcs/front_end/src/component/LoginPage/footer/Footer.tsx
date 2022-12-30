import React from 'react'
import './footer.css'
const Footer = () => {
  return (
    <div className='pong_footer section__pading'>
      <div className='pong_footer-links'>
        {/* <p className= 'siteName'>Pong</p>         */}
        <div className='pong_footer-link-div'>
          <h4>Pong</h4>
          <p>Home</p>
          <p>Chat</p>
          <p>Login</p>
          <p>About</p>
        </div>
        <div className='pong_footer-link-div'>
          <h4>Contact</h4>
          <p>Email</p>
          <p>Linkdin</p>
          <p>Instagram</p>
          <p>About</p>
        </div>
        <div className='pong_footer-link-div'>
          <h4>Pong</h4>
          <p>Home</p>
          <p>Chat</p>
          <p>Login</p>
          <p>About</p>
        </div>
      </div>
      <div className='pong_reserved-right'>
        <p>2022 Pong. All right reserved.</p>
      </div>
    </div>
  )
}

export default Footer