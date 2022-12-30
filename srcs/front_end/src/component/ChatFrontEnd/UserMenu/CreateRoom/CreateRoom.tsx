import React, { useContext } from 'react'
import axios from 'axios';
import { useState } from 'react';
import { GlobalContext } from '../../Chat';
import { Divider } from '../../../game/component/divider';


export default function CreateRoom(props: any) {
  const [test, SetTest] = useState("bro");
  const [ppp, SetPpp] = useState("public");
  const { rooms, setRooms, authData, users, setSelectedChatRoom, selectedChatRoom, socket, setRoomsAndContacts, notify } = useContext(GlobalContext)
  const getLatestRooms = async () => {
    let rmsD = await axios.get(
      "http://" +
  process.env.REACT_APP_IP_ADDRESS +
        ":3000/chat/GetContactsAndRooms",
      { params: { login: authData.login } }
    );
    setRoomsAndContacts(rmsD.data);
	// setRooms(rmsD.data)
  }

  const [inputs, setInputs] = useState({
    type: "public",
    owner: authData.login,
    messages: [],
    createdAt: new Date(),
    name: "",
    admins: [authData],
    banned: [],
    description: "",
    members: [authData],
    password: ""
  });
  const handleChange = (e: any) => setInputs(prevState => ({ ...prevState, [e.target.name]: e.target.value }));

  const create = (event: any) => {
    axios.post("http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/chat/createRoom", inputs).then(res => {
        (async () => {
        // let ar = res.data;
        // SetTest(`f ${res.data} f`)
        notify(`room ${inputs.name} created`)
        getLatestRooms();
      })()
      }).catch(Error => {
        SetTest(`${Error} 👀`)
        // notify("CreateRoom.tsx line: " + Error)
      })
      event.preventDefault();
  }

  const goBackToMenu = () => {
    props.setWhichInterface("MainMenu");
  }
  
  const handleUpdate = () => {
      
  }

  const emptydata = () => {
    notify('name empty');
    props.setWhichInterface("MainMenu");
  }

  return (
    <>
      <form className=' flex flex-col justify-items-center	items-center w-full' >
        <input onChange={handleChange} name="name" defaultValue={inputs.name} placeholder='name of room' className='placeholder-gray-600 m-2 text-lg text-gray-900 bg-gray-400 border-purple-500  focus:border-blue-500 focus:ring-pruple-500 shadow-lg  shadow-purple-500/50 border-2 focus:outline-none rounded-lg flex-none w-3/4 mt-20' ></input>
        <div className='flex flex-row flex-nowrap justify-center '>
          <button  onClick={(event:any) => {event.preventDefault(); SetPpp("public"); setInputs(prevState => ({ ...prevState, [event.target.name]: 'public' })); }} name="type" className={`flex-none inline-flex items-center justify-center overflow-hidden text-sm font-medium ${(ppp=="public") ? "text-black" : "text-white"} rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-2/6 p-3 m-3`}>public</button>
          <button  onClick={(event:any) => {event.preventDefault(); SetPpp("protected"); setInputs(prevState => ({ ...prevState, [event.target.name]: "protected" }));}} name="type" className={`flex-none inline-flex items-center justify-center overflow-hidden text-sm font-medium ${(ppp=="protected") ? "text-black" : "text-white"} rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-2/6 p-3 m-3`}>protected</button>
          <button  onClick={(event:any) => {event.preventDefault(); SetPpp("private"); setInputs(prevState => ({ ...prevState, [event.target.name]: 'private' }));}} name="type" className={`flex-none inline-flex items-center justify-center overflow-hidden text-sm font-medium ${(ppp=="private") ? "text-black" : "text-white"} rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-2/6 p-3 m-3`}>private</button>
        </div>
        <input onChange={handleChange} name="password" defaultValue={inputs.password} placeholder='password' className={`${(ppp!="protected") ? "hidden" : ""} placeholder-gray-600 m-2 text-lg text-gray-900 bg-gray-400 border-purple-500  focus:border-blue-500 focus:ring-pruple-500 shadow-lg  shadow-purple-500/50 border-2 focus:outline-none rounded-lg flex-none w-3/4`} ></input>
        <input onChange={handleChange} name="description" defaultValue={inputs.description} placeholder='description' className='placeholder-gray-600 m-2 text-lg text-gray-900 bg-gray-400 border-purple-500  focus:border-blue-500 focus:ring-pruple-500 shadow-lg  shadow-purple-500/50 border-2 focus:outline-none rounded-lg flex-none w-3/4' ></input>
        <button type="submit" onClick={((inputs.name && inputs.type) ? create : emptydata)} className='flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-2/6 p-3 m-3'> create Room</button>
        <button onClick={goBackToMenu} className='flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-2/6 p-3 m-3'> Main Menu</button>
      </form>

    </>
  )
}

