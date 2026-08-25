import { useCallback, useState } from 'react';
import { audioService } from '../services/audioService';
import { RingtoneId } from '../types';

export function useAudio() {
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  const unlockAudio = useCallback(async () => {
    return await audioService.unlock();
  }, []);

  const playTestRingtone = useCallback((ringtoneId: RingtoneId, volume: number) => {
    setIsPlayingTest(true);
    audioService.playTest(ringtoneId, volume);
    setTimeout(() => {
      setIsPlayingTest(false);
    }, 3000);
  }, []);

  const stopTestRingtone = useCallback(() => {
    setIsPlayingTest(false);
    audioService.stopRingtone();
  }, []);

  return {
    unlockAudio,
    playTestRingtone,
    stopTestRingtone,
    isPlayingTest,
  };
}
