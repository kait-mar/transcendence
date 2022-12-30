import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import './component/style.css';
import './button.css'
import axios from 'axios'

import Box, { BACKGROUND, PLAYER, BALL } from './component/box';
import { io } from 'socket.io-client'
import Select from 'react-select';
import swal from 'sweetalert';
import { Navigate } from "react-router-dom";
// import Home from "../HomePage/Home";
import { isLoggedIn } from "../../api/task.api";
// import { Socket } from "socket.io";


function arraysEqual(a : any, b: any) {

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const ROW_SIZE = 10;
const COL_SIZE = 20;
// const board = [Array(ROW_SIZE * COL_SIZE)];
const PADDLE_BOARD_SIZE = 3;
const PADDLE_EDGE_SPACE = 1;

const InitialState = () => {
  const board = [...Array(PADDLE_BOARD_SIZE)].map((_, pos) => pos);
  return {
      /* Paddle Array */
      player:   board.map(x => (x  * COL_SIZE) + PADDLE_EDGE_SPACE),
      opponent: board.map(x => (x * COL_SIZE) + 18),
      // opponent: board.map(x => ((x+1) * COL_SIZE)-(PADDLE_EDGE_SPACE+1)), if you want to change the space edge later on
      /* ball */
      ball:     Math.round((ROW_SIZE * COL_SIZE)/2)+ ROW_SIZE,          
      ballSpeed: 60,   // speed of ball
      deltaY:   -COL_SIZE, // change ball in Y AXIS
      deltaX:   -1, // change ball in  X AXIS
      /* pause */
      pause:     true, // pause the game
      /* Score */
      playerScore:   0,
      opponentScore: 0,
  }
}

const boardStyle = {
  // width: "250px",
  // heigth: "250px",
//   width: "400px",
  heigth: "400px",
  display: "grid",
  gridTemplate: `repeat(${ROW_SIZE}, 1fr) / repeat(${COL_SIZE}, 1fr)`,
//   marginLeft: '10%',
  marginTop: "20px"
  // overflowY: "scroll"
}

const inner = {
  display: "flex",
  // justify-content: center,
  flexDirection: 'column' as 'column',
  // flexDirection: 'row' as 'row',
  alignItems: "center",
//   justifyContent: "space-around",
//   marginLeft: "25em",
  marginTop: "9em",
  Text: "100px",
  width: "100%",
  padding: "10px"
}

const selectCostume = {
  display: "flex",
  flexDirection: 'row' as 'row',
  justifyContent: "space-around",
}

const text_player = {
  fontSize: '50px',
  color: 'white',
  position: 'absolute' as 'absolute',
  top: '44%',
  left: '17%',
};
const text_opponent = {
fontSize: '50px',
  color: 'white',
  position: 'absolute' as 'absolute',
  top: '44%',
  right: '17%',
}

const first_style = {
  // fontSize: '20px',
  // color: 'white',
  // position: 'relative' as 'relative',
  // top: 0,
  // bottom: 0,
  // left: '10px',
  // right: 0,
  // height: 'fit-content',
  // margin: 'auto',

  fontSize: '12px',
  color: 'white',
  position: 'absolute' as 'absolute',
  top: '69%',
  left: '17%',
};

const second_style = {
  // fontSize: '20px',
  // color: 'white',
  // position: 'relative' as 'relative',
  // top: 0,
  // bottom: 0,
  // left: '40px',
  // right: 0,
  // height: 'fit-content',
  // margin: 'auto',

  fontSize: '12px',
  color: 'white',
  position: 'absolute' as 'absolute',
  top: '69%',
  right: '17%',
}

 /****************************************************************************** */


var socket: any;
var status_socket: any;
export default function GameBoard(props: any) {


  const [player, setPlayer] = useState(InitialState().player);
  const [opponent, setOpponent] = useState(InitialState().opponent);
  const [ball, setBall] = useState(InitialState().ball);
  const ballSpeed = InitialState().ballSpeed;
  const [deltaY, setDeltaY] = useState(InitialState().deltaY);
  const [deltaX, setDeltaX] = useState(InitialState().deltaX);
  const [pause, setPause] = useState(true);
  const [playerScore, setPlayerScore] = useState(InitialState().playerScore);
  const [opponentScore, setOpponentScore] = useState(InitialState().opponentScore);
  const [playerIsSender, setPlayerIsSender] = useState(false);
  const [oppIsSender, setOppIsSender] = useState(false);
  const [order, setOrder] = useState();
  const [ballCostume, setBallCostume] = useState('default');
  const [paddleCostume, setPaddleCostume] = useState('default');
  const [navigate, setNavigate] = useState(false);
  const [endGame, setEndGame] = useState(false);
  const [startGame, setStartGame] = useState(false);
  const [first, setFirst] = useState<string>();
  const [second, setSEcond] = useState<string>();
  const {state}:any = useLocation()

  // const [login, setLogin] = useState()
  // const [socket, setSocket] = useState<Socket | null>(null);
  const [board, setBoard] = useState([...Array(ROW_SIZE * COL_SIZE)].map((_, pos) => {
    let val = BACKGROUND;
    if ((player.indexOf(pos) !== -1) || (opponent.indexOf(pos) !== -1)) {
        val = PLAYER;
    } else if (ball === pos) {
        val = BALL;
    }
    return <Box key={pos} /*costume={costume}*/ name={val} />;
}))

  useEffect(() => {
    socket = io('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/game');
    status_socket = io('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/status'); //ingame status
    return () => {
      socket.emit('_disconnect'); //disconnect socket in component will unmount
      status_socket.emit('_disconnect'); 

    }
  }, [])

  useEffect(() => {
    if (startGame === true) {
      status_socket.emit('user_connected', {user: localStorage.getItem('user'), status: 'ingame'});
    }
  }, [startGame])

    //verify if the user is loggedIn , if yes send token
    useEffect(() => {
      if (state?.invite_game === true || state?.invite_game === false ) {
        const {inviter, inviting, invite_game: invitation_creator} = state;
        socket.emit('invite_game', {inviter, inviting, invitation_creator});
        setFirst(inviter);
        setSEcond(inviting);
      }
      else {
        isLoggedIn().then(async({data}) => {
        })
        .catch(error => {
          // console.error(error);
          end_game('not_connected');
        });
  
        axios.get('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/get-user', {
          withCredentials:true}).then(async({data}) => {
            localStorage.clear();
            localStorage.setItem('user', /*JSON.stringify(*/data.user.nickName);
            if (props.watcher || state?.watched_user) {
              if (props.watcher) {
                socket.emit('watcher_connected',/*localStorage.getItem('user'),*/ props.watcher);
              }
              else if (state?.watched_user) {
                socket.emit('friend_watcher_connected', state?.watched_user);
              }
              // status_socket.emit('user_connected', {user: localStorage.getItem('user'), status: 'online'});
            }
            else {
              socket.emit('player_connected', localStorage.getItem('user'));
            }
          })
          .catch(error=> console.error('error catched in axios get-user'));
      }
      status_socket.emit('user_connected', {user: localStorage.getItem('user'), status: 'online'});
  // eslint-disable-next-line
    }, []);


  useEffect(() => {
    setPause(true); // not sure of this test it very well
    resetGame();

    if (playerScore >= 3 ||  opponentScore  >= 3)
      end_game();
       // eslint-disable-next-line
  }, [playerScore, opponentScore]);

  // don't keep sending score until game ended

  useEffect(() => {
    if (order === 'first')
      socket.emit('Local_playerScore', playerScore);
       // eslint-disable-next-line
  }, [playerScore]);

  useEffect(() => {
    if (order === 'first')
      socket.emit('Local_oponentScore', opponentScore);
       // eslint-disable-next-line
  }, [opponentScore]);


  useEffect(() => {
    const t = setInterval(() => {
      if (!pause){
          bounceBall();
      }
    }, ballSpeed);
    return () => clearInterval(t);
  });


  useEffect(()=> {
    socket.on('order', (ord: any) => {
      setOrder(ord);
    });
    socket.on('player', (pl: any) => {
      if (arraysEqual(pl, player) === false) {
        setPlayer(pl);
        setPause(false);
      }
    });
    socket.on('opponent', (opp: any) => {
      if (arraysEqual(opp, opponent) === false) {
        setOpponent(opp);
        setPause(false);
      }
    });

    socket.on('player_scores', (score: number) => {
      if ( props.watcher || state?.watched_user || order === 'second') {
        setPlayerScore(score);
      }
    });

    socket.on('watcher-player-score', (score: number) => {
      if (props.watcher || state?.watched_user) {
        setPlayerScore(score);
      }
    })

    socket.on('watcher-opponent-score', (score: number) => {
      if (props.watcher || state?.watched_user) {
        setOpponentScore(score);
      }
    })

    socket.on('opponent_scores', (score: number) => {
      if ( props.watcher || state?.watched_user || order === 'second') {
        setOpponentScore(score);
      }

    });
    /******************* */
    socket.on('start_game', (start: boolean) => {
      if (start === true) {
        if (startGame === false)
          setStartGame(true);
      
        swal("Player joined", "Game started\n the Game is played by the Z ad A buttons and ends when reaching 3 scoring");
      }
      else
        swal("wait until another player join ")
    });
    socket.on('already_on_game', () => {
      leave_game_reason("you're already on Game in another tab");
    })
    socket.on('game_ended', () => {
      leave_game_reason("Game ended");
    })
    socket.on('watcher-co-players', (players: string[]) => {
      if (props.watcher || state?.watched_user) {
        setFirst(players[0]);
        setSEcond(players[1]);
      }
    });
    socket.on('co-players', (players: string[]) => {
      if (state?.invite_game === true) {
        return ;
      }
      if (order === 'first') {
        if (players[0] === localStorage.getItem('user')) {
          setFirst(players[0]);
          setSEcond(players[1]);
        }
        else {
          setFirst(players[1]);
          setSEcond(players[0]);
        }
      }
      else {
        if (players[0] === localStorage.getItem('user')) {
          setFirst(players[1]);
          setSEcond(players[0]);
        }
        else {
          setFirst(players[0]);
          setSEcond(players[1]);
        }
      }
    })

    return () => {
      socket.off('player');
      socket.off('opponent');
      socket.off('order');
      socket.off('game_ended');
      socket.off('already_on_game');
    }
  });

    useEffect(() => {
        if (oppIsSender) {
          socket.emit('opponent', opponent);
          setOppIsSender(false);
          var costume: string = 'default';
          setBoard(board.map((_, pos) => {
            let val = BACKGROUND;
            if ((player.indexOf(pos) !== -1) || (opponent.indexOf(pos) !== -1)) {
                val = PLAYER;
                costume = paddleCostume;
        } else if (ball === pos) {
                val = BALL;
                costume = ballCostume;
            }
            return <Box key={pos} costume={costume} name={val} />;
        }))
        }
         // eslint-disable-next-line
    }, [opponent]);
    useEffect(() => {
      if (playerIsSender) {
        socket.emit('player', player);
        setPlayerIsSender(false);
        setBoard(board.map((_, pos) => {
          let val = BACKGROUND;
          let costume = 'default';
          if ((player.indexOf(pos) !== -1) || (opponent.indexOf(pos) !== -1)) {
              val = PLAYER;
              costume = paddleCostume;
          } else if (ball === pos) {
              val = BALL;
              costume = ballCostume
          }
          return <Box key={pos} costume={costume} name={val} />;
      }))
      }
       // eslint-disable-next-line
    }, [player]);

  useEffect(() => {
    setBoard(board.map((_, pos) => {
      let val = BACKGROUND;
      let costume = 'default';
      if ((player.indexOf(pos) !== -1) || (opponent.indexOf(pos) !== -1)) {
          val = PLAYER;
          costume = paddleCostume;
      } else if (ball === pos) {
          val = BALL;
          costume = ballCostume;
      }
      return <Box key={pos} costume={costume} name={val} />;
  }))
   // eslint-disable-next-line
  }, [ball]);
  useEffect(()=> {document.onkeydown = keyInput;})
  const resetGame = () => setBall(Math.round((ROW_SIZE * COL_SIZE)/2)+ ROW_SIZE);

    const moveBoard = (playerBoard: any, isUp: any) => {
      const playerEdge = isUp? playerBoard[0]: playerBoard[PADDLE_BOARD_SIZE-1];
  
      if (!touchingEdge(playerEdge)) {
          const deltaY =  (isUp ? -COL_SIZE : COL_SIZE);
          return playerBoard.map((x : any)=> x + deltaY);
      }      
      return false
  }

  const end_game = (reason: string = 'default') => {
    setPause(true);
    setEndGame(true);
    if (reason === 'not_connected') {
      swal("you're not connected' 🤕 ", "please connect before redirecting to play", "error");
      setNavigate(true);
      return ;
    }
    if (order === 'first')
      socket.emit('scoreUpdate', {playerScore: playerScore, opponentScore: opponentScore});
    else
      socket.emit('scoreUpdate', {playerScore: opponentScore, opponentScore: playerScore});
    if (order === 'first') {
      if (playerScore > opponentScore)
        swal("You Won 🤩 ", "game ednded", "success");
      else
        swal("you lost 🤕 ", "game ednded", "error");
    }
    else if (order === 'second') {
      if (playerScore < opponentScore)
        swal("You Won 🤩 ", "game ednded", "success");
      else
        swal("you lost 🤕 ", "game ednded", "error");
    }
    // socket.emit('disconnect');
    // socket.disconnect();
    setNavigate(true);
  }

  const leave_game = () => {
      swal("You have left game ", "", "success");

    //playerScore is always the score of the current user, and opponent is his opponent
    if (order === 'first')
      socket.emit('scoreUpdate', {playerScore: playerScore, opponentScore: opponentScore, left: true});
    else
      socket.emit('scoreUpdate', {playerScore: opponentScore, opponentScore: playerScore, left: true});
    socket.emit('_disconnect');
    setNavigate(true);
  }

  const leave_game_reason = (reason: string) => {
    swal(reason);
    if (order === 'first')
      socket.emit('scoreUpdate', {playerScore: playerScore, opponentScore: opponentScore});
    else
      socket.emit('scoreUpdate', {playerScore: opponentScore, opponentScore: playerScore});
    socket.emit('_disconnect');
    setNavigate(true);
  }
  const keyInput = ({keyCode} : any) => {
    const PLAYER_DOWN   = 90; /* z */
    const PLAYER_UP = 65; /* a */
    if (endGame || !startGame)
      return ;
    switch (keyCode) {

          case PLAYER_UP:
          case PLAYER_DOWN: {
            if (order === 'first') {
                const movedPlayer = moveBoard(player, keyCode===PLAYER_UP);
                if (movedPlayer) {
                  setPlayerIsSender(true);
                  setPlayer(movedPlayer);
                  setPause(false);
              }
            }
            else if (order === 'second')
            {
              const movedPlayer = moveBoard(opponent, keyCode===PLAYER_UP); 
              if (movedPlayer) {
                  setOppIsSender(true);
                  setOpponent(movedPlayer);
                  setPause(false);
              }
            }
            break;
          }
          default:
              // setPause(true);
              break;
    }   
  }

  /* check if ball is touching the edge of board*/
  const touchingEdge = (pos: any) => (0 <= pos && pos < COL_SIZE) ||
                (COL_SIZE*(ROW_SIZE-1) <= pos && pos < COL_SIZE * ROW_SIZE);
  
  
    /* check if ball is touching the player or opponent paddle */
    const touchingPaddle = (pos: any) => {
      const cond = (deltaX === -1) ? "player":"opponent";
      return (player.indexOf(pos) !== -1) || 
          (opponent.indexOf(pos) !== -1) ||
          cond.indexOf(pos+deltaX) !== -1;
      }

    /* check if ball is touching the botom or top of paddle */
  const touchingPaddleEdge = (pos: any) => player[0] === pos ||
  player[PADDLE_BOARD_SIZE -1] === pos ||
  opponent[0] === pos ||
  opponent[PADDLE_BOARD_SIZE -1] === pos

  /* check if ball made a score */
  const isScore = (pos : any) => (deltaX === -1 && pos % COL_SIZE === 0) || 
          (deltaX === 1 && (pos+1) % COL_SIZE === 0)

  /* bounce the  ball */
  const bounceBall = () => {
    // new ball state
    const newState = ball + deltaY + deltaX;
    if (touchingEdge(newState)) setDeltaY(-deltaY);
    if (touchingPaddleEdge(newState)) setDeltaY(-deltaY);
    if (touchingPaddle(newState)) setDeltaX(-deltaX);
    /* updating board */
    setBall(newState)
    /* checking if loss or won */
      if (isScore(newState)) {
        if (order === 'first') {
          if (deltaX !== -1) {
              /* player won */
              // socket.data.score = playerScore + 1;
              setPlayerScore(playerScore + 1);
              setBall(newState);
          } else {
              /* opponent won */
              setOpponentScore(opponentScore + 1);
              setBall(newState);
          }
      }
        setPause(true);
        resetGame();
    }
  }

  /** render **/
 
  //   let board = [...Array(ROW_SIZE * COL_SIZE)].map((_, pos) => {
  //     let val = BACKGROUND;
  //     let costume = boardCostume;
  //     if ((player.indexOf(pos) !== -1) || (opponent.indexOf(pos) !== -1)) {
  //         val = PLAYER;
  //         costume = playerCostume;
  //     } else if (ball === pos) {
  //         val = BALL;
  //         costume = ballCostume;
  //     }
  //     return <Box key={pos} /*costume={costume}*/ name={val} />;
  // })

  const ball_options = [
    {color: './images/spongy.jpeg', label: 'SpongeBob Ball'},
    {color: './images/choco.jpeg', label: 'Choco Ball'},
    {color: 'default', label: 'Default Yellow'},
    {color: 'default2', label: 'Snow White Ball'},
    {color: './images/strawberry.jpeg', label: 'Strawbery Ball'},
    {color: './images/patrick.gif', label: 'Patrick Ball'},
  ]
  const player_options = [
    {color: './images/choco.jpeg', label: 'Choco paddle'},
    {color: 'default', label: 'Default Blue'},
    {color: './images/strawberry.jpeg', label: 'Strawbery paddle'},
    {color: './images/occean.jpeg', label: 'Occean paddle'},
    {color: './images/spongyFunky.gif', label: 'Spongy paddle'}
  ]

  const selectBall = (e: any) => {
    const selected = e.color;
    let temp = board.map((_: any, pos: number) => {
      if (pos === ball)
        return <Box key={pos} costume={selected} name={BALL} />;
      else
        return _;
    });
    setBallCostume(selected);
    setBoard(temp);
  }

  const selectPlayer = (e: any) => {
    const selected = e.color;
    let temp = board.map((_: any, pos: number) => {
      if ((player.indexOf(pos) !== -1) || (opponent.indexOf(pos) !== -1))
        return <Box key={pos} costume={selected} name={PLAYER} />;
      else
        return _;
    });
    setPaddleCostume(selected);
    setBoard(temp);
  }

  return (
          <>
          <div ></div>
          {!navigate && 
          <>
            {!props.watcher && !state?.watched_user &&  <div style={selectCostume}>
              <Select onChange={selectBall} options={ball_options} placeholder='Ball Costume' />
              <Select onChange={selectPlayer} options={player_options} placeholder='Paddles Costume' />
            </div>}
            <div style={inner}>
              <div style={{height: '100%', position: 'relative', overflow: 'hidden'}}>
                <img style= {{objectFit: 'cover', width: '500px', margin: "auto"}} src={require("./component/images/versus-with-fire.jpeg")} width={'50%'} height={'110px'} alt="background" />
                <h1 style= {text_player}>{playerScore}</h1>
                <h1 style= {text_opponent}>{opponentScore}</h1>
                {/* <div className="co-players"> */}
                  <h1 style= {first_style}>{first}</h1>
                  <h1 style= {second_style}>{second}</h1>
                {/* </div> */}
              </div>
              <div style={boardStyle}>
                  {board}
              </div>
              <div className="div-button">
                <button className="button-78" role="button" onClick={leave_game}>Leave Game</button>
              </div>
            </div>
          </>
          }
          {navigate && <Navigate to = '/' />}
          </>
        );
}

