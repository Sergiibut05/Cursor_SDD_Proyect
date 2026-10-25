import { BrowserRouter, Route, Routes } from 'react-router'
import Marco from './components/Marco.tsx'
import CatalogoPage from './pages/CatalogoPage.tsx'
import EquipoPage from './pages/EquipoPage.tsx'
import FichaPage from './pages/FichaPage.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Marco />}>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/pokemon/:id" element={<FichaPage />} />
          <Route path="/equipo" element={<EquipoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
