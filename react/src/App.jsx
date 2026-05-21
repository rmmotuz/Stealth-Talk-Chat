import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { ChatRoom } from "./pages/ChatRoom";
import { SearchingPage } from "./pages/SearchingPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { GuidelinesPage } from "./pages/GuidelinesPage";
import { LanguageProvider } from "./context/LanguageProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { SocketProvider } from "./context/SocketContext";
import "./styles/global.css";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/searching" element={<SearchingPage />} />
            <Route path="/chat" element={<ChatRoom />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/guidelines" element={<GuidelinesPage />} />
          </Routes>
        </SocketProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
