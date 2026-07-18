import { useState } from 'react';
import { MISSION_BRIEF } from '../data/stations';

interface StartScreenProps {
  onStart: (teamName: string) => void;
}

/** מסך פתיחה: שם קבוצה, תדריך משימה וכפתור התחלה */
export function StartScreen({ onStart }: StartScreenProps) {
  const [teamName, setTeamName] = useState('');
  const canStart = teamName.trim().length > 0;

  return (
    <div className="start-screen">
      <div className="start-card">
        <div className="start-kicker">משימה מסווגת · צוות הנדסה הפוכה</div>
        <h1 className="start-title">חדר בריחה הפוך — מפצחים את לוויין הריגול</h1>
        <p className="start-brief">{MISSION_BRIEF}</p>
        <form
          className="start-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (canStart) onStart(teamName);
          }}
        >
          <label className="start-label" htmlFor="team-name">
            שם הקבוצה
          </label>
          <input
            id="team-name"
            className="start-input"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="הקלידו כאן את שם הקבוצה שלכם"
            maxLength={30}
            autoFocus
          />
          <button type="submit" className="start-button" disabled={!canStart}>
            התחל משימה
          </button>
        </form>
      </div>
    </div>
  );
}
