import React from 'react'
import './header.css';
import pong from '../../../assets/ping_pong_image.png'
import { Link } from 'react-router-dom';
const Header = () => {
  return (
    <div className='pong_header section_padding' id = 'home'>
      <div className='pong_header-content'>
        <h1 className='gradient_text'>
          Ping-Pong Game
        </h1>
        <p>Pong is a table tennis–themed twitch arcade sports video game, featuring simple two-dimensional graphics, manufactured by Atari and originally released in 1972</p>
      <div className='play_sign'>
        <Link to="/game"><button type='button'>Play</button></Link> 
      </div>
      </div>
      <div className='pong_header-image'>
        <img src={pong} alt='pong'/>
      </div>
    </div>
  )
}

export default Header