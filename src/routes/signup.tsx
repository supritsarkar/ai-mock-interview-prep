import { SignUp } from "@clerk/clerk-react"

export default function SignUpPage() {
  return (
    <div>
      <SignUp path="/signup"/>;
    </div>
  )
}
