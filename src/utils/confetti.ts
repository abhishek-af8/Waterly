import confetti from 'canvas-confetti';

export function triggerGoalConfetti() {
  try {
    // Water-themed celebratory burst (blues, cyans, teals, whites)
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#06B6D4', '#38BDF8', '#0EA5E9', '#22D3EE', '#E0F2FE', '#3B82F6'],
      disableForReducedMotion: true,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  } catch {
    // Fallback if canvas-confetti is not supported in environment
  }
}
