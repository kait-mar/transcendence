import React from 'react'
import { useState, useEffect } from 'react';
import { isAuthenticated } from '../../api/task.api';
import './panel.css'
import './getStartedButton.css'
import axios from 'axios'
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom'
import swal from 'sweetalert';
import { io } from 'socket.io-client'

var status_socket: any

export default function GetStarted() {
  
    const navigate = useNavigate();
    const [toggleState, setToggleState] = useState(1);
    const [nickname, setNickname] = useState('');
    const [checkName, setCheckName] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null as any)
    const [user, setUser] = useState()
    const [error, setError] = useState(false)
    const [nickNameFromDb, setNicknameFromDb] = useState(null);
    // const [oldUser, setOldUser] = useState(false)
    // const [submitNameChecker, setSubmitNameChecker] = useState(false)
    // const [submitAvatarChecker, setSubmitAvatarChecker] = useState(false)

    useEffect(() => {
      const getUser = async () => {
        await axios.get('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/get-user', {
          withCredentials:true}).then(async({data}) => {
            if (data.user.getStarted == false) //already created account
              navigate('/connected')
              // setOldUser(true);
            else
              status_socket = io('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/status');
            setNicknameFromDb(data.user.nickName);
          })
          .catch(()=> {
            navigate('/connected')
          })
      }
      getUser();
      return () => {
        if (status_socket)
          status_socket.emit('_disconnect');
      }
    }, [])


    const toggleTab = (index: number) => {
      setToggleState(index);
    };

    const ChangeName = (event: any) => {
        setNickname(event.target.value);
        if (event.target.value.length > 10)
          swal("Nickname too long​", "10 character at maximum", "error")
      }


      const SubmitName = async (e: any) => {
        e.preventDefault();
        if (nickname == '' || nickname.length > 10) {
          swal("Nickname must be between 1 and 10 characters", "", "error")
          return ;
        }
        await axios.post("http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/auth/change-nickname", { nickname: nickname },
                        {withCredentials: true})
                    .then(()=> {
                      setCheckName(true);
                      swal("Nickname succesfuly set​", "", "info");
                    })
                    .catch((err) => {
                      if (err.response.status == 403)
                        swal("Nickname already used​", "you're nickname must be unique", "error");
                      else if (err.response.status == 401)
                        swal("Nickname not valid​", "you're nickname must be alphanumeric", "error");
                      setError(true);
                    })
      }

      //
      const onFileChange = (event: any) => {
        const valid_ext = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']
        let ext: string = event.target.files[0].name
        ext = ext.split('.').splice(-1)[0]
        if (ext && valid_ext.includes(ext)) {
          setSelectedFile(event.target.files[0]);
        }
        else {
          swal("The file extension you uploaded is not valide​", "", "error")
        }
      };

      const onFileUpload = async (e: any) => {
         if (!selectedFile)
          return;
        e.preventDefault();
        const formData = new FormData();
        formData.append(
          "avatar",
          selectedFile,
        );
        const headers = { 'Content-Type': 'multipart/form-data'};
        const fileName = user + '.' + selectedFile.name.split('.')[selectedFile.name.split('.').length - 1];
        await axios.post(`http://` + process.env.REACT_APP_IP_ADDRESS + `:3000/auth/change-avatar/${fileName}`, 
        formData, {withCredentials: true , headers }).catch(err=> console.error('erroooor ' + err))
      };

      const getStartedFunc = async () => {
        let check = 1;
          await axios.get('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/get-user', {
          withCredentials:true}).then(async({data}) => {
            if (data.user.nickName === null) {
              swal("Can't get started​", "review your nickname please!", "error")
              check = 0;
            }
          })
            // if ((nickNameFromDb === null || nickNameFromDb === '') &&
            //     (nickname == '' || error == true || checkName == false)) {
            //   swal("Can't get started​", "review your nickname please!", "error")
            //   return ;

            // }
            if (check === 0)
              return ;
            await axios.post('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/getStarted',{
                getStarted: false,
            }, {
              withCredentials: true,
            })
            .catch(error=> console.error('error catched in axios getStarted'));
            swal("the journey already began 💪​", "", "success")
            navigate('/connected')
      }
      //
    return (
        <div className="gradient__bg">
        <NavBar/>

        <div className="contanar">
        <div className="bloc-tabs">
          <button className={toggleState === 1 ? "tabs active-tabs" : "tabs"} onClick={() => toggleTab(1)}  >
            Set a nickname (*)
          </button>
          <button className={toggleState === 2 ? "tabs active-tabs" : "tabs"} onClick={() => toggleTab(2)}  >
            Set an Avatar
          </button>
        </div>


        <div className="content-tabs">
          {toggleState === 1 && <div className={toggleState === 1 ? "content-panel  active-content" : "content-panel"}>
          <form onSubmit={SubmitName} style={{display: 'flex', flexDirection: 'row', justifyContent: "space-around"}}>
                <label style={{color: 'white', fontSize: '20px'}}>
                new nickName: &nbsp;
                <input type="text" style={{color: 'black'}} onChange={ChangeName} />
                </label>
                {/* <input type="submit" value="Submit" style={{color: "white"}} /> */}
                <button className="button-7" role="button">Submit</button>

            </form>
            <div style={{color:'white', marginTop:'1%', fontSize:'15px'}}>you're nickname must be unique and alphanumeric</div>
          </div>}

          {toggleState === 2 && <div className={toggleState === 2 ? "content-panel  active-content" : "content-panel"}  >
            <form onSubmit={onFileUpload} style={{display: 'flex', flexDirection: 'row', justifyContent: "space-around"}}>
                <label style={{color: 'white'}}>
                Upload Avatar:&nbsp;
                <input type="file"  onChange={onFileChange} />
                </label>
                {/* <input type="submit" value="Submit" /> */}
                <button className="button-7" role="button">Submit</button>
            </form>
          </div>}
        </div>
      </div>
        <div className='getStarted-button-container'>
            {/* <button className="button-86" role="button">Get started</button> */}
            <button className="button-92" role="button" onClick={getStartedFunc}>Get started</button>
        </div>

      </div>
    );

}
