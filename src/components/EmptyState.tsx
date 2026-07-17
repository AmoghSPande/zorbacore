import ExerciseAnim from './ExerciseAnim';

/** Friendly empty section: a moving figure instead of grey silence. */
export default function EmptyState({ anim, title, note }: { anim: string; title: string; note: string }) {
  return (
    <div className="card empty-state">
      <div style={{ width: 150, height: 100, opacity: 0.85 }}>
        <ExerciseAnim animId={anim} />
      </div>
      <div className="es-title">{title}</div>
      <div className="es-note">{note}</div>
    </div>
  );
}
