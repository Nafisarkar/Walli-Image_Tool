import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import MobileMenuButton from "./components/MobileMenuButton/MobileMenuButton";
import MainContent from "./components/MainContent/MainContent";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen bg-background text-foreground overflow-hidden">
      <MobileMenuButton
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <MainContent />
    </div>
  );
}

export default App;
