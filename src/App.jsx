import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Parent from './pages/Parent';
import Family from './pages/Family';
import TextSizeToggle from './components/TextSizeToggle';
import InstallPrompt from './components/InstallPrompt';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <TextSizeToggle />
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/parent" element={<Parent />} />
        <Route path="/family" element={<Family />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
