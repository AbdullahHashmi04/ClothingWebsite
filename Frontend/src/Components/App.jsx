import Footer from "./Footer/Footer.jsx"
import Navbar from "./Navbar/Navbar.jsx"
import { Outlet } from "react-router-dom"
import Chatbot from "../Components/Ai/Chatbot/Bot.jsx"

// import Snowfall from "react-snowfall";

function App() {
  const config = {
    initialMessages: [
      {
        text: "Hello! How can I help you today?",
        sender: "bot",
      },
    ],
    customComponents: {},
  };


  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full pt-20">
        <Outlet />
      </main>
      <Chatbot
        config={config}
      />
      {/* <div style={{ height: "100vh", background: "#0f172a" }}>
      <Snowfall /> 
       </div> */}
      <Footer />
    </div>
  )
}
export default App;