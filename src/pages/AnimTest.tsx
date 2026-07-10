// Temporary QA page for reviewing all animations at once. Not linked from the UI.
import { ANIMS } from '../anim/anims';
import ExerciseAnim from '../components/ExerciseAnim';

export default function AnimTest() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: 8, paddingBottom: 80 }}>
      {Object.keys(ANIMS).map((id) => (
        <div key={id} style={{ border: '1px solid #2a3441', borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: '#9aa7b4', padding: '2px 6px' }}>{id}</div>
          <ExerciseAnim animId={id} />
        </div>
      ))}
    </div>
  );
}
