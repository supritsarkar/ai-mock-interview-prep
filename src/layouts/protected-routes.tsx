import { useAuth } from '@clerk/clerk-react'
import LoaderPage from '@/routes/loader-page'
import React from 'react'
import { Navigate } from 'react-router'

export default function ProtectedRoutes({children,}: {children:React.ReactNode}) {

    const {isLoaded, isSignedIn} = useAuth();//useAuth() is a React hook provided by Clerk
    if(!isLoaded){
        return <LoaderPage/>
    }

    if(!isSignedIn){
        return <Navigate to={"/signin"} replace/> //If you don’t use replace, the protected URL (/dashboard) gets stored in browser history before the redirect happens.
    }

  return children
}
