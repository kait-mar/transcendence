import axios from "axios";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { GlobalContext } from "../../Chat";
import banIcon from "./ban-32.png";
import banIconBlue from "./ban-32blue.png";
import unbanIcon from "./icons8-approved-checkmark-symbol-to-verify-the-result-48.png";
import muteIcon from "./mute-2-32.png";
import muteIconBlue from "./mute-2-32blue.png";
import RemoveIcon from "./trash-9-32 (1).png";
import RemoveIconBlue from "./trash-9-32.png";
import unMute from "./volume-up-4-32.png";
import unMuteSelected from "./volume-up-4-32 (1).png";
import memberToAdmin from "./administrator-2-32.png";
import EnterMuteWindow from "../../EnterMuteWindow/EnterMuteWindow";
// import { Socket } from "socket.io-client";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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

function MemberToBanButton(props: any) {
  const {
    authData,
    users,
    roomsAndContacts,
    setRoomsAndContacts,
    conversationsList,
    setconversationsList,
    selectedChatRoomOrContact,
    setSelectedChatRoomOrContact,
    socket
  } = useContext(GlobalContext);
  const [isBan, setIsBan] = useState(false);
  const [isBanLogoBlue, setIsBanLogoBlue] = useState(false);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const [bannedMembers, setBannedMembers] = useState<any[]>([]);
  // useEffect(() => {
  //   setIsBan(
  //     selectedChatRoomOrContact.roomObj.banned.find(
  //       (mem: any) => props.user.table_id == mem.table_id
  //     )
  //   );
  // }, []);

  const getBannedMembers = async () => {
    // alert("bobo")
    let BannedMembers = await axios.get(
      "http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/chat/bannedUsers",
      { params: { cid: selectedChatRoomOrContact.roomObj.cid } }
    );
    // setBannedMembers(BannedMembers.data);
    // if (BannedMembers.data)
    // alert(JSON.stringify(BannedMembers.data));
    if (BannedMembers.data.find((mem: any) => mem.table_id == props.user.table_id))
      setIsBan(true)
    else
      setIsBan(false)
  };

  useEffect(() => {
    socket.on("updateBannedMembers", (res: any) => {
      if (res.cid == selectedChatRoomOrContact.roomObj.cid)
        getBannedMembers()
    })
  }, [socket])

  useEffect(() => {
    getBannedMembers();
  }, [])

  return (
    <img
      title="ban user"
      onMouseEnter={() => {
        setIsBanLogoBlue(true);
      }}
      onMouseLeave={() => {
        setIsBanLogoBlue(false);
      }}
      onClick={() => {
        // let isBanned = false;
        // getLatestRooms()
        // if (
        //   bannedMembers.find(
        //     (mem: any) => props.user.table_id == mem.table_id
        //   )
        // )
        //     setIsBan(true)
        // else
        //     setIsBan(false)
        // isBanned = true;
        // if (isBan)
        // return ;
        // if (
        //   !setSelectedChatRoom.find((member: any) => {
        //     return member == props.user.login;
        //   })
        // )
        axios
          .post(
            "http://" +
			process.env.REACT_APP_IP_ADDRESS +
              `:3000/chat/${isBan ? "unban" : "ban"}`,
            {
              cid: selectedChatRoomOrContact.roomObj.cid,
              uid: props.user.table_id,
            }
          )
          .then((res) => {
            // if (isBan)
            socket.emit("banUser", { cid: selectedChatRoomOrContact.roomObj.cid, login: props.user.login })
            // else
            // socket.emit("unBanUser", {cid: selectedChatRoomOrContact.roomObj.cid, login: props.user.login})
            getBannedMembers()

            // getLatestRooms();
            // forceUpdate();
            // if (isBanned)
            // alert("uban")
            // alert(selectedChatRoomOrContact.roomObj.members.map((elm:any) => elm.login))
            // if (selectedChatRoomOrContact.roomObj.banned.find((mem:any) => props.user.table_id == mem.table_id))
            // isBanned = true;
            // else
            // isBanned = false;

            // if (isBan) setIsBan(false);
            // else setIsBan(true);

          })
          .catch((Error) => {
            
            notify(Error);
          });
      }}
      className="ml-5 mt-auto mb-auto mr-0 cursor-pointer h-10"
      src={isBan ? unbanIcon : banIcon}
    />
  );
}

function MemberToMuteButton(props: any) {
  const {
    authData,
    users,
    roomsAndContacts,
    setRoomsAndContacts,
    conversationsList,
    setconversationsList,
    selectedChatRoomOrContact,
    setSelectedChatRoomOrContact,
    socket
  } = useContext(GlobalContext);

  const [isMuteLogoBlue, setIsMuteLogoBlue] = useState(false);
  const [mutedMembers, setMutedMembers] = useState<any[]>([]);
  const getMutedMembers = async () => {
    let MuteMembers = await axios.get(
      "http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/chat/mutedUsers",
      { params: { cid: selectedChatRoomOrContact.roomObj.cid } }
    );
    setMutedMembers(MuteMembers.data);
  };

  useEffect(() => {
    socket.on("updateMuteMembers", (res: any) => {
      if (res.cid == selectedChatRoomOrContact.roomObj.cid)
        getMutedMembers()
    })
  }, [socket])

  useEffect(() => {
    getMutedMembers();
  }, [])


  return (
    <img
      title="mute user"
      onMouseEnter={() => {
        setIsMuteLogoBlue(true);
      }}
      onMouseLeave={() => {
        setIsMuteLogoBlue(false);
      }}
      onClick={() => {
        // socket.on("")
        props.setUserToMute(props.user.table_id);
        // alert(props.user.table_id)
        getMutedMembers();
        let isMute = false;
        if (
          mutedMembers.find((mem) => {
            return (
              mem.roomId == selectedChatRoomOrContact.roomObj.cid &&
              mem.login == props.user.table_id
            );
          })
        )
          isMute = true;
        if (!isMute) {
          socket.emit("promptMuteAmount", { login: authData.login, memberTableId: props.user.table_id });
        }
        else
        axios
          .post(
            "http://" +
			process.env.REACT_APP_IP_ADDRESS +
              `:3000/chat/unmute`,
              {
                cid: selectedChatRoomOrContact.roomObj.cid,
                uid: props.user.table_id,
                minutes: 1,
              }
            )
            .then((res) => {
              getMutedMembers();
              socket.emit("updateMuteMembers", { cid: selectedChatRoomOrContact.roomObj.cid })
              isMute = false;
            })
            .catch((Error) => {
              alert(`user ${props.user.login} already muted`);
            });
        getMutedMembers();

      }}
      className="ml-auto mt-auto mb-auto ml-5 cursor-pointer h-10"
      src={
        mutedMembers.find((mem) => {
          return (
            mem.roomId == selectedChatRoomOrContact.roomObj.cid &&
            mem.login == props.user.table_id
          );
        })
          ? unMute
          : muteIconBlue
      }
    />
  );
}

function MemberToRemoveButton(props: any) {
  const {
    authData,
    users,
    roomsAndContacts,
    setRoomsAndContacts,
    conversationsList,
    setconversationsList,
    selectedChatRoomOrContact,
    setSelectedChatRoomOrContact,
  } = useContext(GlobalContext);
  const [isRemoveLogoBlue, setIsRemoveLogoBlue] = useState(false);

  const getLatestRooms = async () => {
    let crD = await axios.get(
      "http://" +
	  process.env.REACT_APP_IP_ADDRESS +
        ":3000/chat/GetContactsAndRooms",
      { params: { login: authData?.login } }
    );
    setRoomsAndContacts(crD.data);
    setSelectedChatRoomOrContact(
      crD.data.find(
        (elm: any) => elm.roomObj.cid == selectedChatRoomOrContact.roomObj.cid
      )
    );
  };

  return (
    <img
      title="remove user"
      onMouseEnter={() => {
        setIsRemoveLogoBlue(true);
      }}
      onMouseLeave={() => {
        setIsRemoveLogoBlue(false);
      }}
      onClick={() => {
        axios
          .post(
            "http://" +
			process.env.REACT_APP_IP_ADDRESS +
              ":3000/chat/removeMember",
            {
              cid: selectedChatRoomOrContact.roomObj.cid,
              uid: props.user.table_id,
            }
          )
          .then((res) => {
            // let ar = res.data;
            // props.setMembers(selectedChatRoomOrContact.roomObj.members);
            // alert("removed! " + JSON.stringify(selectedChatRoomOrContact.roomObj.members.length))
            getLatestRooms();
          })
          .catch((Error) => {
            alert(Error);
          });
      }}
      className="ml-auto mt-auto mb-auto ml-5 cursor-pointer h-10"
      src={isRemoveLogoBlue ? RemoveIconBlue : RemoveIcon}
    />
  );
}

function MemberToUpgradeButton(props: any) {
  const {
    rooms,
    setRooms,
    authData,
    users,
    setSelectedChatRoom,
    selectedChatRoomOrContact
  } = useContext(GlobalContext);
  const [isRemoveLogoBlue, setIsRemoveLogoBlue] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false)
  // const notify = () => toast('Here asdasdads ');

  // const getLatestRooms = async () => {
  //   let rmsD = await axios.get(
  //     "http://" + 'localhost' + `:3000/chat/rooms`,
  //     { withCredentials: true }
  //   );
  //   setRooms(rmsD.data);
  // };

  const checkIfAdmin = async () => {
     axios.get(
       `http://${process.env.REACT_APP_IP_ADDRESS}:3000/chat/isAdmin?cid=${selectedChatRoomOrContact.roomObj.cid}&login=${props.user.login}`
     ).then((res) => {
        
       setIsAdmin(res.data);
     })
   }
  
  useEffect(() => {
    
    const checkIfAdmin = async () => {
     await axios.get(
        `http://${process.env.REACT_APP_IP_ADDRESS}:3000/chat/isAdmin?cid=${selectedChatRoomOrContact.roomObj.cid}&login=${props.user.login}`
      ).then((res) => {
        setIsAdmin(res.data);
      })
    }
    checkIfAdmin()
  }, [])

  return (
    <p
      title="remove user"
      onMouseEnter={() => {
        setIsRemoveLogoBlue(true);
      }}
      onMouseLeave={() => {
        setIsRemoveLogoBlue(false);
      }}
      onClick={() => {
        if (!isAdmin) {
          axios
          .post(
            "http://" +
            process.env.REACT_APP_IP_ADDRESS +
            ":3000/chat/setAdmin",
            { cid: selectedChatRoomOrContact.roomObj.cid, uid: props.user.login.toString(10) }
            )
            .then((res) => {
              notify(`user ${props.user.login} is promoted to admin`)
              // alert("lol")
              checkIfAdmin()
            })
            .catch((Error) => {
              // alert(Error);
            });

          }
          else {
          axios
          .post(
            "http://" +
            process.env.REACT_APP_IP_ADDRESS +
            ":3000/chat/deleteAdmin",
            { cid: selectedChatRoomOrContact.roomObj.cid, uid: props.user.table_id.toString() }
          )
          .then((res) => {
            
            notify(`user ${props.user.nickName} is not an admin no more!`)
            checkIfAdmin()
            
          })
          checkIfAdmin()
          
        }
      }}
      className="ml-auto mr-0 mt-auto mb-auto cursor-pointer text-4xl h-10"

    >{isAdmin ? "📓" : "📖"}

    </p>
  );
}

export default function ManageMembers(props: any) {
  const {
    authData,
    users,
    roomsAndContacts,
    setRoomsAndContacts,
    conversationsList,
    setconversationsList,
    selectedChatRoomOrContact,
    setSelectedChatRoomOrContact,
  } = useContext(GlobalContext);
  let selectedMembers: any = [];
  const [members, setMembers] = useState(
    selectedChatRoomOrContact.roomObj.members
  );
  const [isaddLogoBlue, setIsaddLogoBlue] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [userToMute, setUserToMute] = useState<any>(null);


  const getLatestRooms = async () => {
    let crD = await axios.get(
      "http://" +
	  process.env.REACT_APP_IP_ADDRESS +
        ":3000/chat/GetContactsAndRooms",
      { params: { login: authData?.login } }
    );
    setRoomsAndContacts(crD.data);
  };


  const usrs = selectedChatRoomOrContact.roomObj.members
    .filter((user: any) => {
      return user.login.startsWith(searchInput) && user.login != authData.login && user.login != selectedChatRoomOrContact.roomObj.owner;
    })
    .map((user: any, index: number) => {
      return (
        <li
          key={index}
          className="border h-16 border-gray-800 text-white bg-whathsapp_uns bg-opacity-60 list-none rounded-sm p-0   flex flex-row"
        >
          <h1 className="text-white mt-auto mb-auto ml-7   text-xl ">
            {user.nickName ? user.nickName : user.login}
          </h1>
          <MemberToUpgradeButton selectedMembers={selectedMembers} user={user} />
          <MemberToBanButton selectedMembers={selectedMembers} user={user} />
          <MemberToMuteButton setUserToMute={setUserToMute} selectedMembers={selectedMembers} user={user} />
          <MemberToRemoveButton
            setMembers={setMembers}
            selectedMembers={selectedMembers}
            user={user}
          />
          <EnterMuteWindow
            setMembers={setMembers}
            selectedMembers={selectedMembers}
            user={user}
          />
        </li>
      );
    });
  return (
    <div className="w-full flex flex-col justify-items-center items-center">
      <input
        onChange={(e) => setSearchInput(e.target.value)}
        className=" p-3 w-3/4 m-1 text-lg bg-opacity-30 text-white bg-black border-purple-500  focus:border-blue-500 focus:ring-pruple-500 shadow-lg  shadow-purple-500/50 border-2 focus:outline-none rounded-lg"
        placeholder="enter login"
      ></input>
      <ul className="h-full w-full overflow-auto flex-1">{usrs}</ul>
      <button
        onClick={() => {
          props.setWhichInterface("room settings");
        }}
        className="flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3"
      >
        room settings
      </button>

    </div>
  );
}
