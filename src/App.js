import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import CreateUser from "./pages/CreateUser";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/create-user" element={<CreateUser/>}/>
            </Routes>
        </Router>
    );
}

export default App;
