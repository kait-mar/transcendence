import React, { useContext, useEffect, useReducer, useState } from "react";

import { useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { GlobalContext } from "../../Chat";
import ChatMessage from "./ChatMessage";

import ErrorInterface from "../../ErrorInterface/ErrorInterface";
var text1 =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
var text2 = "lol wasssup";
var status_socket:any;

export default function ChatMessages() {
  const {
    authData,
    socket,
    socketAuth,
    selectedChatRoomOrContact,
    setconversationsList,
    isContactBlock,
    setIsContactBlock,
    setSelectedChatRoomOrContact,
    setlastSelectedChatRoomOrContact,
    lastSelectedChatRoomOrContact,
    messages,
    setMessages

  } = useContext(GlobalContext);
  const [srvrMsg, setSrvrMsg] = useState<any>({});
  const [socketConnected, setSocketConnected] = useState(false);
  const listRef = useRef<any>(null);
  const [isMessagesBlock, setIsMessagesBlock] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  // const [messages, setMessages] = useState<any[]>([]);

  const scrollToBottom = () => {
    listRef.current?.scrollIntoView({ behavior: "instant" });
  };
  useEffect(() => {
    status_socket = io('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/status');
    return () => {
      status_socket?.emit('_disconnect'); 
    }
  }, []);

  useEffect(() => {
    if (socket)
      socket.on("memberLeft", (res: any) => {
        if (!selectedChatRoomOrContact)
          setMessages([])
      })
    if (socket) {
      socket.on('msgToClient', (msg: any) => {
        (async () => {
          let cnvsD = await axios.get(
            "http://" +
            process.env.REACT_APP_IP_ADDRESS +
            ":3000/chat/getConversations",
            { params: { login: authData.login } }
          );
          setconversationsList(cnvsD.data);
        })()

        if (msg.roomCid != selectedChatRoomOrContact?.roomObj.cid)
          return;
        else {
          setMessages((prevstate: any) => [...prevstate, {
            text: msg.text,
            date: Date(),
            ownerId: msg.ownerId,
            nickName: msg.nickname,
            me: false,
          }]);

        }

      });
    }
    return () => {
      socket?.off('msgToClient');
      socket?.off('memberLeft')
    }
  }, [selectedChatRoomOrContact, socket])

  useEffect(()=> {
    axios.get('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/get-user', {
      withCredentials:true}).then(async({data}) => {
        status_socket.emit('user_connected', {user: data.user.nickName, status: 'online'});
      })
}, [])


    if (selectedChatRoomOrContact) {
      socketAuth.on("userBlocked", (res: any) => {
        if (
          (res.toBlock == authData.login &&
            res.blockedBy == selectedChatRoomOrContact.alteredName) ||
          (res.blockedBy == authData.login &&
            res.toBlock == selectedChatRoomOrContact.alteredName)
        ) {
          setIsMessagesBlock(true);
        }
      });
      socketAuth.on("userUnBlocked", (res: any) => {
        if (
          (res.toBlock == authData.login &&
            res.blockedBy == selectedChatRoomOrContact.alteredName) ||
          (res.blockedBy == authData.login &&
            res.toBlock == selectedChatRoomOrContact.alteredName)
        )
          setIsMessagesBlock(false);
      });
    }
 

  const getBlockedUsers = async () => {
    let blockedUsersData = await axios.get(
      "http://" +process.env.REACT_APP_IP_ADDRESS + ":3000/friend/BlockedByWho"
    );
    setBlockedUsers(blockedUsersData.data);
  };




  useEffect(() => {

    getLatestmessage()
  
    if (selectedChatRoomOrContact)
      socket.emit('join', { room: selectedChatRoomOrContact.roomObj.cid, });

  }, [selectedChatRoomOrContact]);







  const isUserBlocked = async (login: string) => {
    let blockedUsersData = await axios.get(
      "http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/friend/BlockedByWho"
    );
    let blockedUsers = blockedUsersData.data;
    if (
      blockedUsers.length &&
      blockedUsers.find((usr: any) => usr.blockedUser.login == login)
    )
      return true;
    return false;
  };

  const getLatestmessage = async () => {

    if (selectedChatRoomOrContact?.roomObj) {

      if (selectedChatRoomOrContact.roomType == 'privategroup') { 
      let blockedUsersData = await axios.get(
        "http://" +
          process.env.REACT_APP_IP_ADDRESS +
          ":3000/friend/BlockedByWho"
        );
        let blockedUsers = blockedUsersData.data;
        if (
          selectedChatRoomOrContact.roomType != 'privategroup'|| !blockedUsers.length ||
          !blockedUsers.find(
            (usr: any) =>
              usr.blockedUser.login == selectedChatRoomOrContact.alteredName
          )
        ) {
        
          setIsMessagesBlock(false)
        }
        else {
          setIsMessagesBlock(true)
        }
      }


  
      if (isMessagesBlock) return
      let msgsData = await axios.get(
        "http://" +
		process.env.REACT_APP_IP_ADDRESS +
          `:3000/chat/messages/${selectedChatRoomOrContact.roomObj.name}`,
        { data: authData }
      );
      setMessages(msgsData.data);
    
    }
  };

  const msgs_ = messages?.map((message: any, index: any) => {
    return (
      <ChatMessage
        key={index}
        sender_name={message.nickName ? message.nickName : message.username}
        text={message.text}
        is_me={message.username == authData.displayname || message.me == true ? true : false}
      />
    );
  }).sort((message: any, message2: any) => {
    return message.createdAt - message2.createdAt;
  })


  return (
    <div
      ref={listRef}
      className="flex-auto h-5/6 bg-black flex-row p-6  overflow-auto snap-y snap-mandatory "
    >
      <div className={`snap-end ${isMessagesBlock && selectedChatRoomOrContact?.roomType == 'privategroup' ? "hidden" : ""}`}>
        <br></br>
        {msgs_}
        <br></br>
      </div>
      {/* <ErrorInterface isBlock={isBlock}  /> */}
    </div>
  );
}
