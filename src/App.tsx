import { useGameState } from './hooks/useGameState';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';

export default function App() {
  const { state, dispatch } = useGameState();

  if (state.phase === 'start') {
    return (
      <StartScreen
        onStart={(teamName) => dispatch({ type: 'START_MISSION', teamName })}
      />
    );
  }

  return <GameScreen state={state} dispatch={dispatch} />;
}
