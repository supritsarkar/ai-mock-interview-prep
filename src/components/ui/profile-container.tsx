import { useAuth, UserButton } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { Link } from "react-router";
import {Button} from "@/components/ui/button";
export default function ProfileContainer() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return(<div className="flex items-center">
      <Loader className="min-w-4 min-h-4 animate-spin text-emerald-500" />
    </div>);
  }

  return <div className="flex items-center gap-6">
    {isSignedIn ? (<UserButton afterSignOutUrl="/"/>) : (
         <Link to={"/signin"}><Button size={"sm"}>Get Started</Button></Link>
        )}
     </div>;
}
