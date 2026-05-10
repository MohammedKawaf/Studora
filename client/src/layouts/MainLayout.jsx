import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Home from "../pages/Home";

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar />
        <Home />
      </main>
    </div>
  );
}

export default MainLayout;