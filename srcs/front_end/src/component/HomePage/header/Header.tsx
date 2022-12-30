import React from 'react'
import './header.css';
import pong from '../../../assets/ping_pong_image.png'
const Header = () => {
  return (
    <div className='pong__header section__pading' id = 'home'>
      <div className='pong_header-content'>
        <h1 className='gradient__text'>
          Ping-Pong Game
        </h1>
      <div className='pong_header-image'>
        <img src={pong} alt='pong'/>
      </div>
        <p>Pong is a table tennis–themed twitch arcade sports video game, featuring simple two-dimensional graphics, manufactured by Atari and originally released in 1972</p>

      <div className='play_sign'>
        <button type='button'>Play</button>
      </div>
      </div>
    </div>
  )
}

export default Header