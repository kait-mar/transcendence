import React, { useContext, useEffect } from 'react'
import { createPortal } from 'react-dom';
import NavBar from '../../ConnectedPage/navBar/NavBar';
import { GlobalContext } from '../Chat';
import axios from 'axios';


const  ChatTitle = (props:any) => {
    const { authData, users, selectedChatRoom, selectedChatRoomOrContact, setconversationsList  } = useContext(GlobalContext)
    const switchCnvsState = () =>
    {
        
    
        (  async () => {
            let cnvsD = await axios.get(
              "http://" +
              process.env.REACT_APP_IP_ADDRESS +
                ":3000/chat/getConversations",
              { params: { login: authData.login } }
              );
              setconversationsList(cnvsD.data);
            })()

        props.setIs_cnvs_shown(props.is_cnvs_shown? false: true);

    }

    const switchMenuState = () =>
    {
        props.setIsMenuShown(props.isMenuShown? false: true);
    }
    const proccess_2by2_room_name = () => {
        if (!selectedChatRoomOrContact)
            return ("");
       
        if (selectedChatRoomOrContact.roomType == "privategroup" && selectedChatRoomOrContact.ContactNickName)
            return selectedChatRoomOrContact.ContactNickName;
        return selectedChatRoomOrContact.alteredName;
    }
    return createPortal(
         <div className='absolute top-0 left-0 right-0 bottom-0 text-white z-[0]  bg-black bg-opacity-50  h-14 flex-none  shadow-lg border-purple-500 shadow-purple-500/50 border-2 flex flex-row'>
            <p className='m-2 p-1 font-bold text-xl flex-none'>{proccess_2by2_room_name()}</p>
            {/* <p className='m-2 p-1 font-bold text-xl flex-none'>{proccess_2by2_room_name()}</p> */}
                <button onClick={switchCnvsState} type='button' className="ml-auto flex-none relative inline-flex items-center justify-center p-0.25 mt-2 mb-2 mr-2 overflow-hidden text-sm font-medium text-black rounded-lg group  bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white hover:border-0  focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-gray-300 bg-opacity-30 border-purple-500  rounded-md group-hover:bg-opacity-0">
                        {props.is_cnvs_shown? "conversations": "conversations"} 
                    </span>
                </button>

                <button onClick={switchMenuState} type='button' className=" flex-none relative inline-flex items-center justify-center p-0.25 mt-2 mb-2 mr-2 overflow-hidden text-sm font-medium text-black rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white hover:border-0 dark:text-black focus:ring-1 focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-gray-300 bg-opacity-30  border-purple-500  rounded-md group-hover:bg-opacity-0">
                     menu
                    </span>
                </button> 
        </div>, 
        document.getElementById("TitleModal")  as HTMLElement
    )
    
}


export default ChatTitle