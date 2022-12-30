import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import { isBlock } from "typescript";
import { isAuthenticated } from "../../../../api/task.api";
import { GlobalContext } from "../../Chat";
import ErrorInterface from "../../ErrorInterface/ErrorInterface";

export default function UserSettings(props: any) {
  const {
    rooms,
    setRooms,
    authData,
    users,
    socket,
    socketNotif,
    selectedChatRoomOrContact,
    socketAuth,
    setIsContactBlock,
    isContactBlock,
    setSocketNotif,
  } = useContext(GlobalContext);
  // let socketNotif: any = null;
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [inviteGame, setInviteGame] = useState("Invite Game");
  // const [socketNotif, setSocketNotif] = useState('')
  let { userId } = useParams();
  const navigate = useNavigate();
  let sender: string;
  const submitToGame: any = (e: any) => {
    e.preventDefault();
    // isAuthenticated().then(({data}) => {
    socketNotif.emit("gameAccepted", {
      sender: sender,
      receiver: authData.login,
    });
    // alert("owo")
    navigate("/game", {
      state: {
        inviting: authData.login,
        inviter: sender,
        invite_game: false,
      },
    });
    // })
  };
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
  const notify = () => {
    toast(acceptOrdeclined, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  useEffect(() => {
    (async () => {
      let blockedUsersData = await axios.get(
        "http://" +
			process.env.REACT_APP_IP_ADDRESS +
          ":3000/friend/BlockedByWho"
      );
      // alert(JSON.stringify(blockedUsersData.data))
      setBlockedUsers(blockedUsersData.data);
    })();
  }, [isContactBlock]);

  // useEffect(() => {
  // toast('🦄 Wow so easy!', {
  //   position: "top-left",
  //   autoClose: 5000,
  //   hideProgressBar: false,
  //   closeOnClick: true,
  //   pauseOnHover: true,
  //   draggable: true,
  //   progress: undefined,
  //   theme: "light",
  //   });
  // }, [])

  useEffect(() => {
    // if (!socketNotif)

    (async () => {
      let blockedUsersData = await axios.get(
        "http://" +
		process.env.REACT_APP_IP_ADDRESS +
          ":3000/friend/BlockedByWho"
      );
      setBlockedUsers(blockedUsersData.data);
      let blockedUsers = blockedUsersData.data;
      if (
        !blockedUsers.length ||
        !blockedUsers.find(
          (usr: any) =>
            usr.blockedUser.login == selectedChatRoomOrContact.alteredName
        )
      ) {
        setIsContactBlock(false);
      } else {
        setIsContactBlock(true);
      }
    })();

 
  });
  
  useEffect(() => {
    socketNotif.on("GameAccepted", (event: any) => {
      // alert("bobo")
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
  
  useEffect(() => {
    const customId = "custom-id-yes";

    socketNotif.on("receiveNotif", (event: any) => {
  
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


  socketAuth.once("userBlocked", (res: any) => {
    if (
      (res.toBlock == authData.login &&
        res.blockedBy == selectedChatRoomOrContact.alteredName) ||
      (res.blockedBy == authData.login &&
        res.toBlock == selectedChatRoomOrContact.alteredName)
    ) {
      setIsContactBlock(true);
    }
  });
  socketAuth.once("userUnBlocked", (res: any) => {
    if (
      (res.toBlock == authData.login &&
        res.blockedBy == selectedChatRoomOrContact.alteredName) ||
      (res.blockedBy == authData.login &&
        res.toBlock == selectedChatRoomOrContact.alteredName)
    ) {
      setIsContactBlock(false);
    }
  });



  const getBlockedUsers = async () => {
    let blockedUsersData = await axios.get(
      "http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/friend/BlockedByWho"
    );
    setBlockedUsers(blockedUsersData.data);
  };

  const isUserBlocked = (login: string) => {
    if (
      blockedUsers.length &&
      blockedUsers.find((usr: any) => usr.blockedUser.login == login)
    )
      return true;
    return false;
  };

  const userBlockedByWho = (login: string) => {
    return blockedUsers.find((usr: any) => {
      return usr.blockerLogin == login;
    });
  };

  const blockUser = async (login: String, isBlock: boolean) => {
    axios
      .post(
        "http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/friend/block",
        { data: { toBlock: login, blockedBy: authData.login, block: isBlock } }
      )
      .then((res) => {
        // alert(res.data)
      })
      .catch((e: any) => {
        alert(e.message);
      });
  };
  let canIUnblock =
    userBlockedByWho(authData.login)?.blockerLogin == authData.login
      ? ""
      : "hidden";

  const submitSocket: any = async (e: any) => {
    e.preventDefault();
    socketNotif.emit("notification", {
      receiver: selectedChatRoomOrContact.alteredName,
      sender: authData.login,
    });
  };

  return (
    <div className="w-full flex flex-col justify-items-center items-center my-auto">
      <button
        onClick={async () => {
          if (
            isUserBlocked(selectedChatRoomOrContact.alteredName) &&
            userBlockedByWho(authData.login)?.blockerLogin == authData.login
          ) {
            await axios.post(
              "http://" +
                process.env.REACT_APP_IP_ADDRESS +
                ":3000/friend/unblock",
              {
                toBlock: selectedChatRoomOrContact.alteredName,
                blockedBy: authData.login,
                block: false,
              }
            );

            socketAuth.emit("unblock", {
              toBlock: selectedChatRoomOrContact.alteredName,
              blockedBy: authData.login,
              block: false,
            });
          } else if (!isUserBlocked(selectedChatRoomOrContact.alteredName)) {

            await axios.post(
              "http://" +
                process.env.REACT_APP_IP_ADDRESS +
                ":3000/friend/block",
              {
                toBlock: selectedChatRoomOrContact.alteredName,
                blockedBy: authData.login,
                block: true,
              }
            );

            socketAuth.emit("block", {
              toBlock: selectedChatRoomOrContact.alteredName,
              blockedBy: authData.login,
              block: true,
            });
          }
          getBlockedUsers();
        }}
        className={`flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3 ${
          isContactBlock ? canIUnblock : ""
        } `}
      >
        {isUserBlocked(selectedChatRoomOrContact.alteredName)
          ? "unblock"
          : "block"}
      </button>
      <button
        className="flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3"
        onClick={(e) => {
          submitSocket(e);

        }}
      >
        send game invite
      </button>
      <button className="flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3"
      onClick={() => {
        navigate(`/user/${selectedChatRoomOrContact.alteredName}`)
      }}
      >
        go to profile
      </button>
      <button
        onClick={() => {
          props.setWhichInterface("MainMenu");
        }}
        className="flex-none inline-flex items-center justify-center  overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-black hover:border-0 dark:text-white focus:ring-1  focus:outline-none focus:ring-black  border border-purple-500 group-hover:border-0 shadow-md shadow-purple-500/50 w-3/6 p-3 m-3"
      >
        main menu
      </button>
    </div>
  );
}
