import { url } from 'inspector';
import React from 'react'

/* Enum */
const BACKGROUND = 0;
const PLAYER = 1;
const BALL = 2;
export {
    BACKGROUND,
    PLAYER,
    BALL,
}


const backgroundStyle = {
    height: "3.8vw",
	maxHeight: "50px",
    width: "3.8vw",
	maxWidth: "50px",
    borderStyle: "solid",
    justifyContent: "center",
    backgroundColor : "black",
    borderRadius: "2px",
}

const playerStyle = {
    height: "3.8vw",
	maxHeight: "50px",
    width: "3.4vw",
	maxWidth: "40px",
    borderStyle: "solid",
    justifyContent: "center",
    backgroundColor : "blue",
    color: "white",
    borderRadius: "5px",
}

const ballStyle = {
    height: "3vw",
    width: "3vw",
    display: "block",
    backgroundColor: "yellow",
    justifyContent: "center",
    borderRadius: "400%",
    // color:"white",
    zIndex: "40",
    position: 'relative'
}

const playerCostume = (costume: string) => {
    if (!costume || costume == 'default')
        return {
            height: "3.8vw",
			maxHeight: "50px",
    		width: "3.4vw",
			maxWidth: "40px",
            borderStyle: "solid",
            justifyContent: "center",
            backgroundColor : "blue",
            color: "white",
            borderRadius: "5px",
        }
    else
        return {
            height: "3.8vw",
			maxHeight: "50px",
    		width: "3.4vw",
			maxWidth: "40px",
            borderStyle: "solid",
            justifyContent: "center",
            backgroundImage: 'url(' + require("" + costume) + ')',
            backgroundSize : "cover",
            color: "white",
            borderRadius: "5px",
        }
}

const boardCostume = (costume: string) => {
    // console.error('boardCostume ===============>[' + costume + ']');
    if (!costume || costume == 'default')
        return {
            height: "3.8vw",
			maxHeight: "50px",
            width: "3.8vw",
			maxWidth: "50px",
            borderStyle: "solid",
            justifyContent: "center",
            backgroundColor : "black",
            borderRadius: "2px",
        }
    else
        return {
            height: "3.8vw",
			maxHeight: "50px",
            width: "3.8vw",
			maxWidth: "50px",
            borderStyle: "solid",
            justifyContent: "center",
            backgroundSize : "cover",
            backgroundImage: 'url(' + require("" + costume) + ')',
            borderRadius: "2px",
        }
}

const ballCostume = (costume: string) => {
    // console.error('ballCostume ===============>[' + costume + ']');
    if (!costume || costume == 'default')
        return {
            height: "3.4vw",
			maxHeight: "40px",
            width: "3.4vw",
			maxWidth: "40px",
            display: "block",
            backgroundColor: "yellow",
            justifyContent: "center",
            borderRadius: "400%",
            // color:"white",
            zIndex: "40",
            position: 'relative' as 'relative'
        }
    else if (costume == 'default2')
        return {
            height: "3.4vw",
			maxHeight: "40px",
            width: "3.4vw",
			maxWidth: "40px",
            display: "block",
            backgroundColor: "white",
            justifyContent: "center",
            borderRadius: "400%",
            // color:"white",
            zIndex: "40",
            position: 'relative' as 'relative'
        }
    else
        return {
            height: "3.4vw",
			maxHeight: "40px",
    		width: "3.4vw",
			maxWidth: "40px",
            display: "block",
            backgroundSize : "cover",
            backgroundImage: 'url(' + require("" + costume) + ')',
            justifyContent: "center",
            borderRadius: "400%",
            // color:"white",
            zIndex: "40",
            position: 'relative' as 'relative'
        }
}

const getStyle = (val : any, costume: string) => {
    // console.error('the recieved costume | ' + costume);
    if (val === BACKGROUND) {
        // return boardCostume(costume);
        return {};
    } if (val === PLAYER) {
        return playerCostume(costume);
    } else {
        return ballCostume(costume);
    }
}

const Box = (props: any) => {
    return (<div style={backgroundStyle}> 
        <div style={getStyle(props.name, props.costume)} /> 
    </div>)
}


export default Box;
