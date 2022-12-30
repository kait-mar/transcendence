
import React, { Component, createContext, useContext } from 'react';


interface ContextValueType {

    isAuthenticated?: boolean,
    user?: any,
    isLoading?: boolean,
    logout?: (...p: any) => any
}

