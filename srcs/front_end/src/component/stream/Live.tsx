import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { io } from 'socket.io-client'
import Game from "../game/GameBoard";
import './stream.css'
import axios from 'axios';

// var status_socket: any

export default function Live() {

    const [room, setRoom] = useState('none');
    const [games, setGames] = useState(null);
    var selected_game;

    const socket = io('http://'+process.env.REACT_APP_IP_ADDRESS+':3000/game')

    useEffect(()=> {
      socket.emit('ShowGame');
    }, [])

    useEffect(() => {
      socket.on('chooseGame', (games: any) => {
        setGames(games);
      });
      return () => {
        socket.off('chooseGame');
      }
    });


    const selectedGame = (e: any) => {
      const selected = e.room;
      setRoom(selected);
    }

    const selectCostume = {
      display: "flex",
      flexDirection: 'row' as 'row',
      justifyContent: "space-around",
    }

    var comp;
    if (games === null)
      comp = <div className="void">No available games to watch!</div>
    else
       comp = (<div style={selectCostume}>
                <Select onChange={selectedGame} options= {games} placeholder= 'choose an OnGoing game to watch'/>
              </div>)

  return (
        <div>
        {/* <Select onChange={selectedGame} options= {op}/> */}
          {room == 'none' &&  comp}
          {room == 'none' && <div className="stream-image">
            <img src={require('../../images/demo_game.gif')} className= 'img' />
          </div>}
        <div>
          {room != 'none' && <Game watcher = {room}/>}
        </div>
    </div>
  )
}
