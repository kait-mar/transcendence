import React, {useEffect, useState} from 'react';
import './login.css';
import {getQrcode, isAuthenticated } from '../../../api/task.api'
import { Buffer } from 'buffer';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';


export const Login = () => {
  const navigate = useNavigate(); 
  const [qrCode, setQrcode] = useState('');
  const [response, setResponse] = useState(Boolean);
  const [data, setData] = useState('');
  const [activated, setActivated] = useState(true); 

  const enabling2FA = () => {
        getQrcode()
        .then(async res => {
          const qr = Buffer.from(res.data, 'binary').toString('base64')
          setQrcode(qr);
          setActivated(false)
        })
        .catch(err => {
          console.error(err)});
  }
  useEffect (() => {
    isAuthenticated()
    .then(({data}) => {
      if (data.isTwoFactoAuthenticationEnabled === false)
      {
        if (qrCode === '')
          enabling2FA();
      }
    })
    twoFactorAuthentication();
  }, [qrCode, activated])

  let codeValue: string;
  const handle = (e : any) => {
    codeValue = e.target.value;
  }

  const submit = async (e: any) => {
    e.preventDefault();
    await axios.post("http://"+process.env.REACT_APP_IP_ADDRESS+":3000/auth/turn-on",{
      twoFactorAuthenticationCode : codeValue,
    }, {
      withCredentials: true,
    })
    .then(res => {
      navigate("/connected");
    })
    .catch(err => {
      setResponse(false);
      const danger = document.getElementById('danger');
      danger!.style.display = "block";
    });
  }

  function twoFactorAuthentication()
  {
    if (!activated)
    {
      return <div className="pong_login section__pading">
      <div className='pong_logins'>
       <div className='pong_login'>
        <h2>
          Google Authenticator
        </h2>
      </div>
      <div className="content">
        <div className="form">
          <div className="auth">
             < img src= {"data:image/png;base64," + qrCode}  alt="" width="250" height="250" border-radius="50%" /> 
              <div className='qr_code_form'>
                <form onSubmit={(e)=> submit(e)}>
                  <input onChange={(e) => handle(e)}  placeholder= "Code Qr" type="text"></input>
                </form>
              </div>
          <button type='button' onClick={(e)=>submit(e)}>
            <p>
            Submit
            </p>
          </button>
          <div className='message'>
            <div className= 'danger' id='danger'>Wrong Code!</div>
          </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    }
    else if (activated)
    {
      return <div className="pong_login section__pading">
      <div className='pong_logins'>
       <div className='pong_login'>
        <h2>
          Google Authenticator
        </h2>
      </div>
      <div className="content">
        <div className="form">
          <div className="auth">
              <div className='qr_code_form'>
                <form onSubmit={(e)=> submit(e)}>
                  <input onChange={(e) => handle(e)}  placeholder= "Code Qr" type="text"></input>
                </form>
              </div>
          <button type='button' onClick={(e)=>submit(e)}>
            <p>
            Submit
            </p>
          </button>
          <div className='message'>
            <div className= 'danger' id='danger'>Wrong Code!</div>
          </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    }
  }

  return (
    // <div className="pong_login section__pading">
    //   <div className='pong_logins'>
    //    <div className='pong_login'>
    //     <h2>
    //       Google Authenticator
    //     </h2>
    //   </div>
    //   <div className="content">
    //     <div className="form">
    //       <div className="auth">
    //          < img src= {"data:image/png;base64," + qrCode}  alt="" width="250" height="250" border-radius="50%" /> 
    //           <div className='qr_code_form'>
    //             <form onSubmit={(e)=> submit(e)}>
    //               <input onChange={(e) => handle(e)} value={data} placeholder= "Code Qr" type="text"></input>
    //             </form>
    //           </div>
    //       <button type='button' onClick={(e)=>submit(e)}>
    //         <p>
    //         Submit
    //         </p>
    //       </button>
    //       <div className='message'>
    //         <div className= 'danger' id='danger'>Wrong Code!</div>
    //       </div>
    //       </div>
    //     </div>
    //   </div>
    //   </div>
    // </div>
    <>
      {twoFactorAuthentication()}
    </>
  )
}

export default Login;