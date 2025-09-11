import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import Container from "@/components/ui/container";
import { Outlet } from "react-router";

export const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen ">
      {/* handler to store user data */}
      <Header />
      <Container className="flex-grow ">
        <main className="flex-grow">
          <Outlet />
        </main>
      </Container>
      <Footer />
    </div>
  );
};
