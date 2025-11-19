import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Publiclayout } from "@/layouts/public-layout";

import { HomePage } from "@/routes/Home";

import AuthenticationLayout from "@/layouts/auth-layout";
import SignInPage from "./routes/signin";
import SignUpPage from "./routes/signup";
import ProtectedRoutes from "./layouts/protected-routes";
import { MainLayout } from "./layouts/main-layout";
import { Generate } from "./components/ui/generate";
import { Dashboard } from "./routes/dashboard";
import { CreateEditPage } from "./routes/create-edit-page";
import { MockLoadPage } from "./routes/mock-load-page";
import { MockInterviewPage } from "./routes/mock-interview-page";
import { Feedback } from "./routes/feedback";

export default function App() {
  return (
    <Routes>
      {/* public routes this is the default route for the index */}
      <Route element={<Publiclayout />}>
        <Route index element={<HomePage />} />
      </Route>
      {/* auth routes*/}
      <Route element={<AuthenticationLayout />}>
        <Route path="/signin/*" element={<SignInPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />
      </Route>
      {/* protected routes*/}
      <Route
        element={
          <ProtectedRoutes>
            <MainLayout />
          </ProtectedRoutes>
        }
      >
        {/* add your protected routes here */}
        <Route element={<Generate />} path="/generate">
         {/* An index route means: This should show when the parent route itself is visited. */}
          <Route index element={<Dashboard />} />
          <Route path=":interviewId" element={<CreateEditPage />} />
          <Route path="interview/:interviewId" element={<MockLoadPage />} />
          <Route path="interview/:interviewId/start" element={<MockInterviewPage />} />
          {/* FIXED: feedback directly under /generate */}
          <Route path="feedback/:interviewId" element={<Feedback />} />
        </Route>
      </Route>
    </Routes>
  );
}
