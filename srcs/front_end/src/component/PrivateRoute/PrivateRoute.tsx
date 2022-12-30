import React, { Component, useEffect, useState } from "react";
import { isAuthenticated, isLoggedIn } from "../../api/task.api";
import { Route, Navigate, RouteProps } from 'react-router-dom';
import ConnectedPage from "../ConnectedPage/ConnectPage";


function PrivateRoute(){
   const  [loggedIn, setLoggedIn] = useState(Boolean);

    isLoggedIn().then(({data}) => {setLoggedIn(data.loggedIn)})
}

export default PrivateRoute


