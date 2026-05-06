import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login.tsx';
import Register from './Pages/Register.tsx';
import PlantInfo from './Pages/PlantInfo.tsx';
import AddPlant from './Pages/AddPlant';
import './App.css'
import { ThemeProvider } from './theme/ThemeContext';

function App() {

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/Register" element={<Register />}/>
                    <Route path="/PlantInfo" element={<PlantInfo/>}/>
                    <Route path="/AddPlant" element={<AddPlant/>}/>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App