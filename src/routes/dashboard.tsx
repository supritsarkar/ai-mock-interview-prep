import { Button } from "@/components/ui/button"
import { Headings } from "@/components/ui/headings"
import InterviewPin from "@/components/ui/pin"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/config/firebase.config"
import type { Interview } from "@/types"
import { useAuth } from "@clerk/clerk-react"
import { Separator } from "@radix-ui/react-separator"
import { collection, onSnapshot,  query, where } from "firebase/firestore"
import { Plus } from "lucide-react"
import {  useEffect, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"



export const Dashboard = () => {
   const [interviews,setInterviews] = useState<Interview[]>([])
   const [loading,setLoading] = useState(false) 
   const {userId} = useAuth()

   useEffect(() => {
    setLoading(true);
    const interviewQuery = query(collection(db, "interviews"), where("userId", "==", userId));

    const unsubscribe = onSnapshot(interviewQuery, (snapshot) => {
      const interviewsList: Interview[] = snapshot.docs.map((doc) => {
        const id = doc.id
        return { id, ...doc.data() } 
      }) as Interview[];
      setInterviews(interviewsList);  
      setLoading(false);
    },(error) => {
      toast.error("Error..",{ description: "Could not fetch interviews. Try again" })
    })


    return () => unsubscribe();
   }, [userId]);

   
  
  return <>
    <div className="flex w-full items-center justify-between">
        {/* Headings*/}
         <Headings title="Dashboard" description="Create and start your AI interview!"/>
        
    <Link to={"/generate/create"}> 
    <Button size={"sm"}>
        <Plus/>Add New

    </Button>
    </Link>
    </div>

    <Separator className="my-8" />
        {/* Content section*/}


    {/* loading ? Array.from({length: 6}).map((_,index) :-  _ means: “I don’t need this value”    */ }
    <div className="md:grid md:grid-cols-3 gap-3 py-4">
      {loading ? Array.from({length: 6}).map((_,index) => (
       <Skeleton key={index} className="h-[20px] w-[100px] rounded-full" />
      )): interviews.length > 0 ? interviews.map((interview) =>
        <InterviewPin key={interview.id}  interview={interview}/>
      
      ): (
          <div className="md:col-span-3 w-full flex flex-grow items-center justify-center h-96 flex-col">
            <img
              src="/assets/svg/not-found.svg"
              className="w-44 h-44 object-contain"
              alt=""
            />

            <h2 className="text-lg font-semibold text-muted-foreground">
              No Data Found
            </h2>

            <p className="w-full md:w-96 text-center text-sm text-neutral-400 mt-4">
              There is no available data to show. Please add some new mock
              interviews
            </p>

            <Link to={"/generate/create"} className="mt-4">
              <Button size={"sm"}>
                <Plus className="min-w-5 min-h-5 mr-1" />
                Add New
              </Button>
            </Link>
          </div>
        ) }
      </div>    
  </>
}


