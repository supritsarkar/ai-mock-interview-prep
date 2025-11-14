import { db } from "@/config/firebase.config";
import type { Interview } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link, replace, useNavigate, useParams } from "react-router";
import LoaderPage from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, WebcamIcon } from "lucide-react";
import InterviewPin from "@/components/ui/pin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Webcam from "react-webcam";

export const MockLoadPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState<boolean>(false);

  const navigate = useNavigate();

  if (!interviewId) {
    navigate("/generate", { replace: true });
  }

  useEffect(() => {
    const fetchInterview = async () => {
      if (interviewId) {
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            setInterview({
              id: interviewDoc.id,
              ...interviewDoc.data(),
            } as Interview);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchInterview();
  }, [interviewId, navigate]);

  if (loading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5 ">
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrumb
          breadCrumbPage={interview?.position || ""}
          breadCrumbItems={[{ label: "Mock Interviews", link: "/generate" }]}
        />

        <Link to={`/generate/interview/${interviewId}/start`}>
          <Button size={"sm"}>
            Start
            <Sparkles />
          </Button>
        </Link>
      </div>

      {interview && <InterviewPin interview={interview} onMockPage />}
      <Alert className="bg-yellow-100/50 border-yellow-200 p-4 rounded-lg flex items-start gap-3 -mt-3">
        <Lightbulb className="h-5 w-5 text-yellow-600" />
        <div>
            <AlertTitle className="text-yellow-800 font-semibold">
            Important Information
          </AlertTitle>
           <AlertDescription className="text-sm text-yellow-700 mt-1">
            Please enable your webcam and microphone to start the AI-generated
            mock interview. The interview consists of five questions. You’ll
            receive a personalized report based on your responses at the end.{" "}
            <br />
            <br />
            <span className="font-medium">Note:</span> Your video is{" "}
            <strong>never recorded</strong>. You can disable your webcam at any
            time.
          </AlertDescription>
        </div>
      </Alert>
       <div className="flex items-center justify-center w-full h-full">
         <div className="w-full h-[400px] md:w-96  flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
           
           {isWebcamEnabled ? (
                <Webcam
                 onUserMedia={()=>setIsWebcamEnabled(true)}
                 onUserMediaError={()=>setIsWebcamEnabled(false)}
                 className="w-full h-full object-cover rounded-md"
                />
           ):(
            <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground"/>
           )}

         </div>
       </div>
       
       <div className="flex items-center justify-center">
        <Button onClick={()=>setIsWebcamEnabled(!isWebcamEnabled)}>
            {isWebcamEnabled ? "Disable Webcam" : "Enable Webcam"}
        </Button>

       </div>





    </div>
  );
};
