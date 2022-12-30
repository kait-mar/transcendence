import React from 'react'
import './login.css'

const Login = () => {
  return (
    <div className="pong_login section__pading">
      <div className='pong_logins'>
       <div className='pong_login'>
        <h2>
          Login
        </h2>
        <p>Sign to your account</p>
      </div>
      <div className="content">
        <div className="form">
          <div className="auth">
          <button type='button' onClick={()=> (window.location.href= 'http://' + process.env.REACT_APP_IP_ADDRESS + ':3000/auth/login')}>
            <p>
            Intranet Authentification
            </p>
          </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Login