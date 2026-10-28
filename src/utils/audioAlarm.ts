/**
 * Web Audio API synthesizer for emergency sirens and distress audio feedback.
 * Operates purely client-side without external media assets.
 */

class SafetyAlarmManager {
  private ctx: AudioContext | null = null;
  private isAlarmRunning = false;
  private oscillatorNode: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private timerId: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startSiren() {
    if (this.isAlarmRunning) return;
    this.initContext();
    if (!this.ctx) return;

    this.isAlarmRunning = true;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();

    this.oscillatorNode = osc;
    this.gainNode = gain;

    // Siren frequency cycle (wail from 600Hz to 1250Hz)
    let freqHigh = true;
    this.timerId = window.setInterval(() => {
      if (!this.ctx || !this.oscillatorNode) return;
      const targetFreq = freqHigh ? 1200 : 650;
      this.oscillatorNode.frequency.exponentialRampToValueAtTime(
        targetFreq,
        this.ctx.currentTime + 0.35
      );
      freqHigh = !freqHigh;
    }, 400);
  }

  public stopSiren() {
    this.isAlarmRunning = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.oscillatorNode) {
      try {
        this.oscillatorNode.stop();
        this.oscillatorNode.disconnect();
      } catch {
        // ignore already stopped
      }
      this.oscillatorNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  public isPlaying(): boolean {
    return this.isAlarmRunning;
  }

  public playCueChime() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }
}

export const alarmManager = new SafetyAlarmManager();
