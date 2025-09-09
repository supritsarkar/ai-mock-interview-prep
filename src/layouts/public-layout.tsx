import { Footer } from "@/components/footer"
import {Header}   from "@/components/header"
import { Outlet } from "react-router"


export const Publiclayout=()=> {
  return (
    <div className="w-full">
      {/* handler to store user data */}
      <Header/>
      <Outlet/>
      <Footer/>
    </div>
  )
}
