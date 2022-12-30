import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { cleanValue } from 'react-select/dist/declarations/src/utils';
import { io } from 'socket.io-client';
import { GlobalContext } from '../Chat';




export default function ConversationItem(props: any) {
  const { authData , setSelectedChatRoom, selectedChatRoom,  rooms, socket} = useContext(GlobalContext)
  const [msgs, setMsgs] = useState<any[]>([]);
  const [count, setCount] = useState<number>(0);

  // useEffect(() => {
  //   getLatestmessage();
  //   if (rooms.length)
  //     setSelectedChatRoom(rooms[0])
  // }, [])

  // if (selectedChatRoom) {
  //   socket.on("newMessage", (res: any) => {
  //     if (res.room === selectedChatRoom.name) 
  //       getLatestmessage(); 
  //   })
  // }

  // useEffect(()=> {
  //   socket.emit('join', { room: props.room.roomObj.cid, });
  // }, [])

  const getLatestmessage = () => {
    axios.get(`http://` + process.env.REACT_APP_IP_ADDRESS +   `:3000/chat/messages/${props.room.name}`, { data: authData }).then((res) => {
      setMsgs(res.data)
    })
  }

  const changeRoom = () => {
    setSelectedChatRoom(props.room)
    props.SetWhoseSelected(selectedChatRoom.name);
  }

const proccess_2by2_room_name = () => {
        if (props.room.type == 'privategroup') {
            const twoLogins = props.room.name.split(" - ");
            return twoLogins[0] === authData.login? twoLogins[1]: twoLogins[0]; 
        }
        return props.room.name;
    }

  return (
    // <div onClick={changeRoom} className='grid grid-rows-2 gap-3 m-0 p-3'>
    <div  className='grid grid-rows-2 gap-3 m-0 p-3'>
      {/* <p className='text-lg'>{proccess_2by2_room_name()}</p> */}
      {/* <p className='text-base text-gray-400 ml-1'>{msgs.length? msgs[msgs.length - 1].text: ""}</p> */}
      <p className='text-lg'>{props.cnv.ContactNickName? props.cnv.ContactNickName: props.cnv.alteredName}</p>
      <p className='text-base text-gray-400 ml-1'>{props.cnv.msg}</p>
    </div>
  )
}
