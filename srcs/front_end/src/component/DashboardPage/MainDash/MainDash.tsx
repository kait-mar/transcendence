
import { useEffect, useState } from 'react'
import './MainDash.css'
import Cards from '../Cards/Cards'
import Tables from '../Table/Table'
import { isAuthenticated } from '../../../api/task.api'
import NavBar from '../navBarDashboard/NavBar'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'


var status_socket:any

const MainDash = () => {
  const [avatar, setAvatar] = useState('');
  const [user, setUser] = useState('');
  const [nickName, setNickName] = useState('');
  const navigate = useNavigate()
  let sender: string;
  let userToSendGame: string;
  let userToSendFriend: string;
  useEffect(() => {
    status_socket = io('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/status');
    return () => {
      status_socket?.emit('_disconnect'); 
    }
  }, [])

  useEffect(()=> {
      axios.get('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/get-user', {
        withCredentials:true}).then(async({data}) => {
          status_socket.emit('user_connected', {user: data.user.nickName, status: 'online'});
        })
  }, [])


  let socket: any;
  useEffect(() => {
    isAuthenticated()
    .then(({data}) => {
      setUser(data.login);
      setNickName(data.nickName);
      setAvatar(data.avatar);
     });
   },[avatar, user, nickName])

  const submitToGame :any = (e: any) => {
    e.preventDefault();
    isAuthenticated().then(({data}) => {
    socket.emit('gameAccepted', {sender: sender, receiver: data.login});
    navigate('/game', {
      state:{
        inviting: data.login,
        inviter: sender,
        invite_game: false
      }
    })

    })}
  
  const acceptOrdeclined = () => {
    return (
      <div>
    <div>
      {userToSendGame} wants to play!! 
    </div>
    <button className="button-85" role="button"  onClick={(e)=>submitToGame(e)}>
      accept
    </button>
      </div>
    )
  }

  const notify = () => {
    toast(acceptOrdeclined, {position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
  }

  const submitAccept = async(e: any) => {
   await axios.post('http://'+process.env.REACT_APP_IP_ADDRESS+':3000/friend/friendResponse',{
        friendStatus: "accepted",
        user : user,
        sender : sender
    }, {
      withCredentials: true,
    })
    .catch(err => {
      const sent = document.getElementById('error');
      sent!.style.display = "block";
    });
  }

    const acceptOrdeclinedF = () => {
    return (
      <div>
    <div>
      {userToSendFriend} wants to be friend!! 
    </div>
    <button className="button-85" role="button"  onClick={(e)=>submitAccept(e)}>
      accept
    </button>
      </div>
    )
  }

  const friendNotify = () => {
    toast(acceptOrdeclinedF, {position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    });

  }

  useEffect(() => { 
  socket = io("http://"+process.env.REACT_APP_IP_ADDRESS+":3000");
  socket.emit('user_connected', user)
    socket.on("receiveNotif", async (event: any) => {
      if (event.receiver === user)
    {
      sender = event.sender;
      await axios.post("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/auth/getId", {
        userId : sender,
      }, { withCredentials: true})
      .then(({data}) => {
        userToSendGame = data.nickName;
      })
      notify();
    }
    })
    socket.on('receiveFriendRequest', async (event: any) => {
      if (event.receiver === user)
      {
          sender = event.sender;
        await axios.post("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/auth/getId", {
          userId : sender,
        }, { withCredentials: true})
        .then(({data}) => {
          userToSendFriend = data.nickName;
        })
          friendNotify();
        }
      })
    socket.on('GameAccepted',(event: any) => {
      if (event.accepted === true && event.sender === user)
      {
        navigate('/game',{
          state:{
            inviter: user,
            inviting: event.receiver,
            invite_game: true,
          }
        } 
        )
      }
    })
    return () => {
      socket.off("receiveNotif",(event: any) => {
      socket.disconnect();
    } );
      socket.emit('_disconnect');
    };
  } )
  // END HERE

  return (
    <div className="maindash">
      <NavBar/> 
        <h1>
            My Profile
        </h1>
        <ToastContainer />
        <Cards/>
        <Tables/>
    </div> 
  )
}

export default MainDash