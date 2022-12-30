import React, { useEffect, useReducer } from "react";
import { useState, createContext, useContext } from "react";
import ChatPrompt from "./ChatPrompt/ChatPrompt";
import ChatTitle from "./ChatTitle/ChatTitle";
import SideBar from "./sideBar/SideBar";
import UserMenu from "./UserMenu/UserMenu";
import axios, { AxiosResponse } from "axios";
import { isAuthenticated } from "../../api/task.api";
import { io } from "socket.io-client";
import ChatMessages from "./ChatMessages/ChatMessage/ChatMessages";
import ErrorInterface from "./ErrorInterface/ErrorInterface";
import EnterPasswordWindow from "./EnterPasswordWindow/EnterPasswordWindow";
import {Routes, Route, Navigate, useNavigate} from 'react-router-dom'
import { redirect } from "react-router-dom";
import { ConnectedPage, Home } from "..";
import NavBar from "../ConnectedPage/navBar/NavBar";
import { toast, ToastContainer } from "react-toastify";



interface ChatMessage {
  messageId: string;
  text: string;
  roomId: string;
  ownerId: string;
  username: string;
  createdAt: Date;
}

interface ChatRoom {
  cid: string;
  type: any;
  owner: string;
  messages: ChatMessage[];
  createdAt: Date;
  name: string;
  password?: string;
  admins: any;
  banned: any;
  description: any;
  members: any;
}


const GlobalContext = createContext<any>(null);

const Chat = (log:any) => {
  const [is_cnvs_shown, setIs_cnvs_shown] = useState(false);
  const [isMenuShown, setIsMenuShown] = useState(false);
  const [isLogged, setisLogged] = useState(false);
  let is_cnvs = is_cnvs_shown ? "2/3" : "full";
  let [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [socketAuth, setSocketAuth] = useState<any>(null);
  const [socketNotif, setSocketNotif] = useState<any>(null);
  const [roomsAndContacts, setRoomsAndContacts] = useState<any[]>([]);
  const [conversationsList, setconversationsList] = useState<any[]>([]);
  const [authData, setAuthData] = useState<any>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(
    null
    );
    const [lastSelectedChatRoomOrContact, setlastSelectedChatRoomOrContact] = useState<any>(null);
    const [selectedChatRoomOrContact, setSelectedChatRoomOrContact] =
    useState<any>(null);
    const [selectedChatRoomMembers, setSelectedChatRoomMembers] = useState<any[]>(
      []
      );
      const [users, setUsers] = useState<any[]>([]);
      const [isContactBlock, setIsContactBlock] = useState(false);
      const [state, setState] = useState(log);
      const [_, forceUpdate] = useReducer((x) => x + 1, 0);
      
      const navigate = useNavigate();
      
      
      const notify = (text:string) => {
        toast(text, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          });
      } 
    useEffect(()=>{
        setState(log);
    }, [log])

    useEffect(() => {
      return () => {
        socket?.emit('_disconnect');
        socketAuth?.emit('_disconnect');
        socketNotif?.emit('_disconnect');
      }
    }, [])
    let sender: string;

  useEffect(() => {
    axios.defaults.withCredentials = true;
    (async () => {
      let authD = null;
      try {
        if (!authData) {
          authD = await isAuthenticated();
          setAuthData(authD.data);
          
        }
        let cnvsD = await axios.get(
          "http://" +
		  process.env.REACT_APP_IP_ADDRESS +
            ":3000/chat/getConversations",
          { params: { login: authD?.data.login } }
        );
        let crD = await axios.get(
          "http://" +
		  process.env.REACT_APP_IP_ADDRESS +
            ":3000/chat/GetContactsAndRooms",
          { params: { login: authD?.data.login } }
        );
        setconversationsList(cnvsD.data);
        setRoomsAndContacts(crD.data);
        if (cnvsD.data.length) {
          {
            setSelectedChatRoomOrContact(cnvsD.data[0]);
            // alert(JSON.stringify(cnvsD.data[0].nickName))
          }
        }
        let usrs = await axios.get(
          "http://" +
		  process.env.REACT_APP_IP_ADDRESS +
            ":3000/chat/getallUsers"
        );
        setUsers(usrs.data);
        // if (selectedChatRoomOrContact.type == "privategroup" && await isUserBlocked(selectedChatRoomOrContact.alteredName))
        // setIsContactBlock(true);
        let blockedUsersData = await axios.get(
          "http://" +
		  process.env.REACT_APP_IP_ADDRESS +
            ":3000/friend/BlockedByWho"
        );
        let blockedUsers = blockedUsersData.data;
        if (
          !blockedUsers.length ||
          !blockedUsers.find(
            (usr: any) =>
              usr.blockedUser.login == selectedChatRoomOrContact?.alteredName
          )
        )
          setIsContactBlock(false);
        else setIsContactBlock(true);   
        //   }
      }
      catch (e) {
      }

    })();
  }, []);



  if (!socket && authData) {
    const socket = io(
      "ws://" + process.env.REACT_APP_IP_ADDRESS + ":3000/chat",
      { query: { user_login: authData.login } }
      );
      setSocket(socket);
    }

    if (!socketAuth && authData) {
    const socketauth = io(
      "ws://" + process.env.REACT_APP_IP_ADDRESS + ":3000/auth"
    );
    setSocketAuth(socketauth);
  }
  if (!socketNotif && authData) {
    const socketnotif = io(
      "ws://" + process.env.REACT_APP_IP_ADDRESS + ":3000"
    );
    setSocketNotif(socketnotif);
    socketnotif.emit('user_connected', authData.login);
  }

  const submitToGame: any = (e: any) => {
    e.preventDefault();
    socketNotif.emit("gameAccepted", {
      sender: sender,
      receiver: authData.login,
    });
    navigate("/game", {
      state: {
        inviting: authData.login,
        inviter: sender,
        invite_game: false,
      },
    });
  };

  useEffect(() => {
    socketNotif?.on("GameAccepted", (event: any) => {
      if (event.accepted === true && event.sender === authData.login) {
        navigate("/game", {
          state: {
            inviter: authData.login,
            inviting: event.receiver,
            invite_game: true,
          },
        });
      }
    });
    
  }, [socketNotif])
  const acceptOrdeclined = () => {
    return (
      <div>
        <div>{sender} wants to play!!</div>
        <button
          className="button-85"
          role="button"
          onClick={(e) => submitToGame(e)}
        >
          accept
        </button>
      </div>
    );
  };
  
  useEffect(() => {
    const customId = "custom-id-yes";

    socketNotif?.on("receiveNotif", (event: any) => {
    // alert("trigger")
    if (event.receiver === authData.login) {
      sender = event.sender;

      toast(acceptOrdeclined, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        toastId: customId
      });
    }
  });  
}, [socketNotif])

  

useEffect(() => {
  socket?.on("roomSelected", (res:any)=> {
    // alert(JSON.stringify(res))
  })
  socket?.on('connection', (socket: any) => {
    console.log('chat socket',socket);
  })

}, [socket])


  const connected= (log: Boolean) =>{
      if (log === false)
      {
            return   (<Home log = {log}/>)
      }
      else if (log === true)
      { 
        
          return (
            <div className="flex flex-row w-screen bg-black	">
              <GlobalContext.Provider
                value={{
                  authData,
                  setAuthData,
                  selectedChatRoom,
                  setSelectedChatRoom,
                  socket,
                  users,
                  selectedChatRoomMembers,
                  setSelectedChatRoomMembers,
                  conversationsList,
                  setconversationsList,
                  roomsAndContacts,
                  setRoomsAndContacts,
                  selectedChatRoomOrContact,
                  setSelectedChatRoomOrContact,
                  socketAuth,
                  setSocketAuth,
                  isContactBlock,
                  setIsContactBlock,
                  socketNotif,
                  setSocketNotif,
                  setlastSelectedChatRoomOrContact,
                  messages,
                  setMessages,
                  notify
                }}
              >
                <SideBar
                  is_cnvs_shown={is_cnvs_shown}
                  setIs_cnvs_shown={setIs_cnvs_shown}
                  messages={messages}
                  SetMessages={setMessages}
                />
                <UserMenu
                  isMenuShown={isMenuShown}
                  setIsMenuShown={setIsMenuShown}
                />
                <ErrorInterface />
                <div className={` h-screen w-full flex-none flex flex-col`}>
                  
                  <ChatTitle
                    is_cnvs_shown={is_cnvs_shown}
                    setIs_cnvs_shown={setIs_cnvs_shown}
                    open={open}
                    setOpen={setOpen}
                    isMenuShown={isMenuShown}
                    setIsMenuShown={setIsMenuShown}
                    authData={authData}
                  />
                  <ChatMessages />
                  <ChatPrompt />
                  <ToastContainer />

                </div>
              </GlobalContext.Provider>
            </div>
          );
        }      
  }
  return (
    <>
        {connected(state.log)}
    </>
  );
};

export default Chat;
export { GlobalContext };
