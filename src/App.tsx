import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import Train from './pages/Train';
import RunPage from './pages/Run';
import Coach from './pages/Coach';
import Progress from './pages/Progress';
import Library from './pages/Library';
import ExerciseDetail from './pages/ExerciseDetail';
import Settings from './pages/Settings';
import Chat from './pages/Chat';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/train" element={<Train />} />
        <Route path="/run" element={<RunPage />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/library" element={<Library />} />
        <Route path="/library/:id" element={<ExerciseDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Nav />
    </>
  );
}
