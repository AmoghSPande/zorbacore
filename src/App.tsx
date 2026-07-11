import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import Nav from './components/Nav';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Train from './pages/Train';
import RunPage from './pages/Run';
import Coach from './pages/Coach';
import Progress from './pages/Progress';
import Library from './pages/Library';
import ExerciseDetail from './pages/ExerciseDetail';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import Habits from './pages/Habits';
import Food from './pages/Food';
import AnimTest from './pages/AnimTest';

export default function App() {
  // distinguish "still loading" (undefined) from "no profile yet" (null)
  const profile = useLiveQuery(async () => (await db.profile.get('me')) ?? null, []);

  // per-style accent theme (emerald hybrid, amber trek, violet yoga, …)
  useEffect(() => {
    const style = profile?.trainingStyle ?? 'hybrid';
    if (style === 'hybrid') delete document.documentElement.dataset.style;
    else document.documentElement.dataset.style = style;
  }, [profile?.trainingStyle]);

  if (profile === undefined) return null; // db still opening
  if (profile === null || !profile.onboarded) return <Onboarding />;
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
        <Route path="/habits" element={<Habits />} />
        <Route path="/food" element={<Food />} />
        <Route path="/animtest" element={<AnimTest />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Nav />
    </>
  );
}
