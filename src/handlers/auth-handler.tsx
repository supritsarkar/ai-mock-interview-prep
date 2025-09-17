import { db } from "@/config/firebase.config";
import LoaderPage from "@/routes/loader-page";
import type { User } from "@/types";
import { useUser } from "@clerk/clerk-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

export default function AuthHandler() {
  const { isSignedIn, user } = useUser();
  const pathName = useLocation().pathname;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storeUserData = async () => {
      if (isSignedIn && user) {
        setLoading(true);
        try {
          console.log(user);
          const userSnap = await getDoc(doc(db, "users", user.id));
          console.log("Does user exist? ", userSnap.exists());

          if (!userSnap.exists()) {
            const userData: User = {
              id: user.id,
              name: user.fullName || user.firstName || "Anonymous",
              email: user.primaryEmailAddress?.emailAddress || "N/A",
              imageUrl: user.imageUrl,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(doc(db, "users", user.id), userData);
          }
        } catch (error) {
          console.log("Error in AuthHandler while storing the data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    storeUserData();
  }, [isSignedIn, user, pathName, navigate]);

  if (loading) {
    return <LoaderPage />;
  }

  return null;
}
