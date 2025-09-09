import {SignIn } from "@clerk/clerk-react"

export default function SignInPage() {
  return (
    <div>
      <SignIn path="/signin"/>
    </div>
  )
}
