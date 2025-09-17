import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import { Outlet } from "react-router";
import AuthHandler from "@/handlers/auth-handler";

export const Publiclayout = () => {
  return (
    <div className="w-full">
      {/* handler to store user data */}
      <AuthHandler />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};
