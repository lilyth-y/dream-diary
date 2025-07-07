import { useEffect, useState } from 'react';
import { getDreams } from '../../../dream-diary-common/dreamService';

export default function Home() {
  const [dreams, setDreams] = useState<any[]>([]);

  useEffect(() => {
    getDreams().then(setDreams);
  }, []);

  return (
    <div>
      <h1>루비드 드림 다이어리 (웹)</h1>
      <ul>
        {dreams.map((dream) => (
          <li key={dream.id}>{dream.title || '제목 없음'}</li>
        ))}
      </ul>
    </div>
  );
} 