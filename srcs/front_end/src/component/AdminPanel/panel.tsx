import React from 'react'
import { useState, useEffect } from 'react';
import { isAuthenticated } from '../../api/task.api';
import './panel.css'
import axios from 'axios'
import swal from 'sweetalert';

export default function Panel() {
    const [toggleState, setToggleState] = useState(1);
    const [nickname, setNickname] = useState('');
    const [userData, setUserData] = useState();
    const [avatar, setAvatar] = useState() //set it to default avatar
    const [selectedFile, setSelectedFile] = useState(null as any)
    const [user, setUser] = useState()


    useEffect(() => {
        const loadData = async() => {
          isAuthenticated().then(({data}) => {
            setUserData(data);
          })
        }
        loadData();
      }, []);

      useEffect(()=> {
        axios.get('http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/get-user', {
          withCredentials:true}).then(async({data}) => {
            setUser(data.user.login)
          })
      }, [])

    const toggleTab = (index: number) => {
      setToggleState(index);
    };

    const ChangeName = (event: any) => {
      if (event.target.value.length > 10)
        swal("Nickname too long​", "10 character at maximum", "error")
        setNickname(event.target.value);
      }


      const SubmitName = async (event: any) => {
        // alert('A name was submitted: ' + nickname);
        event.preventDefault();
        if (nickname == '' || nickname.length > 10)
          return ;
        await axios.post("http://" + process.env.REACT_APP_IP_ADDRESS + ":3000/auth/change-nickname", { nickname: nickname },
                        {withCredentials: true})
                    .then(()=> {
                      swal("Nickname successfuly changed​", "continue as " + nickname, "success");
                    })
                    .catch((err) => {
                      if (err.response.status == 403)
                        swal("Nickname already used​", "you're nickname must be unique", "error");
                      else if (err.response.status == 401)
                        swal("Nickname not valid​", "you're nickname must be alphanumeric", "error");
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
        await axios.post(`http://${process.env.REACT_APP_IP_ADDRESS}:3000/auth/change-avatar/${fileName}`, 
        formData, {withCredentials: true , headers })
        window.location.reload();
      };
      //
    return (
      <div className="admin-panelContainer">
        <div className="bloc-tabs">
          <button className={toggleState === 1 ? "tabs active-tabs" : "tabs"} onClick={() => toggleTab(1)}  >
            Change nickname
          </button>
          <button className={toggleState === 2 ? "tabs active-tabs" : "tabs"} onClick={() => toggleTab(2)}  >
            Change Avatar
          </button>
        </div>


        <div className="content-tabs">
          {toggleState === 1 && <div className={toggleState === 1 ? "content-panel  active-content" : "content-panel"}>
            <form onSubmit={SubmitName} style={{display: 'flex', flexDirection: 'row', justifyContent: "space-around"}}>
                <label style={{color: 'white', fontSize: '20px'}}>
                new nickName :
                <input type="text" style={{color: 'black'}} onChange={ChangeName} />
                </label>
                <button className="button-7" role="button">Submit</button>
            </form>
            <div style={{color:'white', marginTop:'1%', fontSize:'15px'}}>you're nickname must be unique and alphanumeric</div>
          </div>}

          {toggleState === 2 && <div className={toggleState === 2 ? "content-panel  active-content" : "content-panel"}  >
            <form onSubmit={onFileUpload}>
                <label style={{color: 'white'}}>
                Upload Avatar :
                <input type="file"  onChange={onFileChange} />
                </label>
                <button className="button-7" role="button">Submit</button>
            </form>
          </div>}
        </div>
      </div>
    );
}

