import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login.tsx';
import Register from './Pages/Register.tsx';
import PlantInfo from './Pages/PlantInfo.tsx';
import AddPlant from './Pages/AddPlant';
import UpdatePlant from './Pages/UpdatePlant.tsx';
import IdkMyPlant from './Pages/IdkMyPlant.tsx';
import SimilarPlants from "./Pages/Similarplants.tsx";
import './App.css'
import { ThemeProvider } from './theme/ThemeContext';

function App() {

    return (
        <ThemeProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/Register" element={<Register />}/>
                    <Route path="/PlantInfo" element={<PlantInfo/>}/>
                    <Route path="/UpdatePlant" element={<UpdatePlant/>} />
                    <Route path="/AddPlant" element={<AddPlant/>}/>
                   <Route path="/IdkMyPlant" element={<IdkMyPlant/>}/>
                    <Route path="/SimilarPlants" element={<SimilarPlants/>} />
                </Routes>
            </HashRouter>
        </ThemeProvider>
    )
}

export default App