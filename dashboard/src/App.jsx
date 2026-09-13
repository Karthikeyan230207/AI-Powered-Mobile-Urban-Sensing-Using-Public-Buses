import React from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="app-shell">
      <Sidebar active="overview" />
      <div className="app-main">
        <Topbar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
