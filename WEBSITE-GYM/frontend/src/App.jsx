import { BrowserRouter, Routes, Route } from "react-router-dom";
import { generateRoutes } from "./routes/index.jsx";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {generateRoutes()}
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;