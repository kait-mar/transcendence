import React from 'react'

export default function ChatMessage(props: any) {
  return (
    <>
      <div className={'max-w-md break-words shadow-2xl font-bold border rounded-xl p-2 m-4 flex-1 ' + (props.is_me ? 'ml-auto bg-purple-600  shadow-purple-500/50 border-purple-500' :  ' bg-opacity-50 border-0 mr-auto bg-gray-600')}>
        <p className={'text-blue-500 ' + (props.is_me ? 'hidden' : '')}>
          {props.sender_name}
        </p>
        <p className='text-lg text-white'>
          {props.text}
        </p>
      </div>
    </>
  )
}
