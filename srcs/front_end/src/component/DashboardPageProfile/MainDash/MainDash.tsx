import { useEffect, useState } from 'react'
import './MainDash.css'
import Cards from '../Cards/Cards'
import Tables from '../Table/Table'
import { isAuthenticated } from '../../../api/task.api'
import NavBar from '../navBarDashboard/NavBar'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client'


var status_socket:any;

const MainDash = () => {
  const [avatar, setAvatar] = useState('');
  const [info, setInfo] = useState('Add Friend');
  const [inviteGame, setInviteGame] = useState('Invite Game');
  const [friend, setFriend] = useState('');
  let { userId } = useParams();
  const [user, setUser] = useState('');
  const [block, setBlock] = useState(false);
  const [nickName, setNickName] = useState('');
  const [userParamId, setUserParamId] = useState('');
  const [blockedBy, setBlockedBy] = useState('');

  const navigate = useNavigate();
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
  const toAuthenticat = async()=>{
    await isAuthenticated()
    .then(({data}) => {
      setUser(data.login);
      setNickName(data.nickName);
     });
    }
  const findTheUser = async() => {
    await axios.post("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/auth/getId", {
      userId : userId,
    }, { withCredentials: true})
    .then(({data}) => {
      setAvatar(data.avatar);
      setUserParamId(data.nickName);
    })
  }
    toAuthenticat();
    findTheUser();
   },[nickName, userParamId, avatar])

   useEffect(() => {
  const findTheBlocker = async() =>{
    await axios.post("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/friend/byBlock", {
      user: userId,
    },
    {
      withCredentials: true,
    }).then(({data}) => {
      setBlockedBy(data.blockedBy);
    })
  }
    findTheBlocker();
   }, [])

  const submitToGame :any = (e: any) => {
    e.preventDefault();
    isAuthenticated().then(({data}) => {
    socket.emit('gameAccepted', {sender: sender, receiver: data.login});
    navigate('/game', {
      state:{
        inviting: data.nickName,
        inviter: userParamId,
        invite_game: false
      }
    })
  })}
  
  const acceptOrdeclined = () => {
    return (
      <div>
    <div>
      {userParamId} wants to play!! 
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
  const submit: any= async(e: any) => {
    e.preventDefault();
 
   await axios.post("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/friend/sendRequest",{
       creator : user,
       receiver: userId,
    }, {
      withCredentials: true,
    })
    .then(res => {
      socket.emit('sendRequest', {sender:nickName, receiver:userId});
      setFriend('pending');
    })
  }
  const submitAccept = async(e: any) => {
   await axios.post('http://'+process.env.REACT_APP_IP_ADDRESS+':3000/friend/friendResponse',{
        friendStatus: "accepted",
        user : user,
        sender : sender
    }, {
      withCredentials: true,
    })
    .then(res => {
      setFriend('accepted') ;
      socket.emit("friendRequestAccepted", {sender: sender, receiver:user});
    })
    .catch(err => {
      const sent = document.getElementById('error');
      sent!.style.display = "block";
    });
    navigate(0);
  }

    const acceptOrdeclinedF = () => {
    return (
      <div>
        <div>
          {userParamId} wants to be friend!! 
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


  // Socket NOTIF START HERE
  const submitSocket: any = async (e:any) => {
    e.preventDefault();
    socket.emit('notification', {
      receiver: userId,
      sender:user, 
    })
  }
  
  useEffect(() => { 
   socket = io("http://"+process.env.REACT_APP_IP_ADDRESS+":3000");
   socket.emit('user_connected', user);
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
    socket.on('receiveFriendRequest', async(event: any) => {
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
    socket.on('friendRequestAcceptIt', (event: any) =>{
      if (event.sender === user)
      {
        setInfo("Friend");
        setFriend('accepted');
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
      });
      socket.off("friendRequestAcceptIt", () => {
        socket.disconnect();
      })
      socket.off("GameAccepted", () => {
        socket.disconnect();
      })
      socket.off("receiveFriendRequest", () => {
        socket.disconnect();
      })
      socket.off('sendRequest', (event: any) => {
        socket.disconnect();
      });
      socket.emit('_disconnect');
    };
  })

  // Block Friend 
  const submitBlock: any = async (e:any) => {
    e.preventDefault();
    await axios.post("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/friend/block",
      {
        toBlock: userId,
        blockedBy: user,
        block: true,
      },
      {
        withCredentials: true,
      }
      )
      .then(({data}) => {
        setBlock(data.block);
        setBlockedBy(data.blockedBy);
      })
    navigate(0);
  }

  const submitUnBlock: any = async (e:any) => {
    e.preventDefault();
    await axios.post("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/friend/unblock",
      {
        toBlock: userId,
        blockedBy: user,
        block: false,
      },
      {
        withCredentials: true,
      }
      )
      .then(({data}) => {
        setBlock(false);
        setInfo('Add Friend');
        setFriend('');
      })
      .catch(err => {console.error('err ==> ' + err)});
    navigate(0);
  }
   
  useEffect(() =>{
        axios.post("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/friend/requestStatus",{
          creator : user,
          receiver : userId
        }, {
          withCredentials: true,
        }).then(({data}) => {
          if(data.status === "accepted")
          {
            setInfo("Friend");
            setFriend('accepted');
          }
        }).catch((err) => console.error("STATUS ERR"));
        axios.post("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/friend/checkBlock",{
          creator : user,
          receiver : userId
        }, {
          withCredentials: true,
        }).then(({data}) => {
          if (data.status === "blocked")
            setBlock(true);
        }).catch((err) => console.error("STATUS ERR"));
        addFriend();
        ifUserBlocked();
      },[block, info, friend]) 

    function addFriend() {
      if (friend === "accepted")
      { 
        return(
              <>
               <button className='butt' >
                <a className='Texti'>
                  {"Friend " + "🤝"} 
                </a>
              </button>
              </>
        )
      }
      else if (friend === "pending")
      {
        return(
              <>
               <button className='butt'>
                <a className='Texti'>
                {"Invitation Sent   🤝"} 
                </a>
              </button>
              </>
        )
      }  
      else
        {
        return(
              <>
               <button className='but'  onClick={(e)=>submit(e)}>
                <a className='Texti'>
                  {info}
                </a>
              </button>
              </>
        )
        }
    }

    function gameInvitation() {
      if (inviteGame === "sent")
      { 
        return(
              <>
               <button className='inviteGame' >
                <a className='Texti'>
                  {"Invitation sent " + "🤝"} 
                </a>
              </button>
              </>
        )
      }
      else
        {
        return(
              <>
               <button className='inviteGame'  onClick={(e)=>submitSocket(e)}>
                <a className='Texti'>
                  {inviteGame}
                </a>
              </button>
              <ToastContainer />
              </>
        )
        }

    }

    function blockUser() {
      if (block === true && blockedBy === user )
      { 
        return(
              <>
               <button className='inviteGames'  onClick={(e)=>submitUnBlock(e)}>
                <a className='Textii'>
                  Unblock 
                </a>
              </button>
              </>
        )
      }
      else if (block === false)
      {
        return(
              <>
               <button className='inviteGames'  onClick={(e)=>submitBlock(e)}>
                <a className='Textii'>
                  Block
                </a>
              </button>
              <ToastContainer />
              </>
        )
      }
    }

    function  ifUserBlocked(){ 
      if (userId !== user && block === false)
      {
        return <>
            <div className="friendRequest">
            <h1>
              {userParamId}
              < img src= {avatar} style={{marginLeft:'30px', marginTop:'5px'}} alt='profil' width="80" height="80" border-radius="50%"/> 
            </h1>
            {addFriend()}
            {gameInvitation()}
            {blockUser()}
            </div>
              <Cards/>
              <Tables/>
          </>
      }
      else if (user === userId)
      {
        navigate('/user/admin')
      }
      else if (userId !== user && block === true)
      {
        return <>
            <div className="friendRequest">
            {blockUser()}
            </div>
          </>
      }
    }

  return (
    <div className="maindash">
      <NavBar/> 
      {ifUserBlocked()}
    </div> 
  )
}

export default MainDash