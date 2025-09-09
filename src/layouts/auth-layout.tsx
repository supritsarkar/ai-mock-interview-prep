import React from 'react'
import { Outlet } from 'react-router'

const AuthenticationLayout = () => {
  return (
     <div className="w-screen h-screen overflow-hidden flex items-center justify-center relative ">
      {/* handler to store user data */}
      <img src="/assets/img/bg.png" className='absolute w-full h-full object-cover opacity-20' alt="" />
      <Outlet/>
     
    </div>
  )
}

export default AuthenticationLayout
