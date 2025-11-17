export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.audioBuffer = null;
    this.activeNotes = new Map(); // Track playing notes with their source nodes
    this.isInitialized = false;
    this.masterGain = null;
  }

  async init() {
    if (this.isInitialized) {
      console.log('AudioEngine already initialized');
      return;
    }

    try {
      // Create AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('AudioContext created, state:', this.audioContext.state);

      // Create master gain node for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.5;
      
      // ADD THIS: Create reverb
      this.reverb = this.createReverb();
      
      // CHANGE THIS: Connect master -> reverb -> destination
      this.masterGain.connect(this.reverb.input);
      this.reverb.connect(this.audioContext.destination);

      // Load the harp sample
      await this.loadSample('/sounds/Harp-C4.mp3');

      this.isInitialized = true;
      console.log('AudioEngine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioEngine:', error);
      throw error;
    }
  }

  createReverb() {
    // Create a simple reverb using multiple delay lines
    const reverbGain = this.audioContext.createGain();
    reverbGain.gain.value = 0.3; // Wet/dry mix (30% reverb)
    
    const delays = [];
    const gains = [];
    
    // Create 4 delay lines with different times for a richer reverb
    const delayTimes = [0.023, 0.037, 0.053, 0.067]; // Prime numbers for less metallic sound
    const feedbackAmount = 0.5; // How much the delays feed back
    
    delayTimes.forEach((time, i) => {
      const delay = this.audioContext.createDelay();
      delay.delayTime.value = time;
      
      const gain = this.audioContext.createGain();
      gain.gain.value = 0.7 / delayTimes.length; // Divide to prevent buildup
      
      const feedback = this.audioContext.createGain();
      feedback.gain.value = feedbackAmount;
      
      // Create feedback loop: input -> delay -> gain -> output
      //                                 ↑          ↓
      //                                 ← feedback ←
      delay.connect(gain);
      gain.connect(feedback);
      feedback.connect(delay);
      
      delays.push(delay);
      gains.push(gain);
    });
    
    // Create input splitter and output mixer
    const dryGain = this.audioContext.createGain();
    dryGain.gain.value = 0.7; // Dry signal level
    
    const wetGain = this.audioContext.createGain();
    wetGain.gain.value = 0.3; // Wet signal level
    
    const input = this.audioContext.createGain();
    const output = this.audioContext.createGain();
    
    // Connect dry path
    input.connect(dryGain);
    dryGain.connect(output);
    
    // Connect wet paths
    delays.forEach((delay, i) => {
      input.connect(delays[i]);
      gains[i].connect(wetGain);
    });
    wetGain.connect(output);
    
    // Store reference to input node for connection
    output.input = input;
    
    return output;
  }

  async loadSample(url) {
    try {
      console.log('Loading sample from:', url);
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      // iOS 12 Safari uses callback-based decodeAudioData, not promise-based
      this.audioBuffer = await new Promise((resolve, reject) => {
        this.audioContext.decodeAudioData(
          arrayBuffer,
          (decodedBuffer) => {
            resolve(decodedBuffer);
          },
          (error) => {
            reject(error);
          }
        );
      });
      
      console.log('Sample loaded successfully, duration:', this.audioBuffer.duration);
    } catch (error) {
      console.error('Failed to load sample:', error);
      throw error;
    }
  }

  // Convert note name to frequency
  noteToFrequency(note) {
    const noteMap = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };

    // Parse note (e.g., "C4", "F#5")
    const match = note.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) {
      console.error('Invalid note format:', note);
      return 261.63; // Default to C4
    }

    const noteName = match[1];
    const octave = parseInt(match[2]);

    // Calculate MIDI note number
    const noteNumber = noteMap[noteName];
    const midiNote = (octave + 1) * 12 + noteNumber;

    // Convert MIDI to frequency: f = 440 * 2^((n-69)/12)
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    return frequency;
  }

  // Calculate playback rate to pitch-shift from C4 to target note
  getPlaybackRate(targetNote) {
    const c4Frequency = 261.63; // C4 frequency
    const targetFrequency = this.noteToFrequency(targetNote);
    return targetFrequency / c4Frequency;
  }

  playNote(note, stringId = null) {
    if (!this.isInitialized || !this.audioBuffer) {
      console.warn('AudioEngine not initialized or sample not loaded');
      return;
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const key = stringId || note;

    // CHANGED: Instead of stopping, check how many instances are playing
    // Allow up to 3 simultaneous instances per string
    const existingInstances = Array.from(this.activeNotes.entries())
      .filter(([k, v]) => k.startsWith(key + '_'));
    
    if (existingInstances.length >= 3) {
      // Remove the oldest instance with a gentle fade
      const [oldestKey, oldestData] = existingInstances[0];
      const now = this.audioContext.currentTime;
      try {
        oldestData.gainNode.gain.setValueAtTime(oldestData.gainNode.gain.value, now);
        oldestData.gainNode.gain.linearRampToValueAtTime(0, now + 0.2); // Gentler 200ms fade
        oldestData.source.stop(now + 0.2);
      } catch (e) {
        // Already stopped
      }
      this.activeNotes.delete(oldestKey);
    }

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffer;

      const playbackRate = this.getPlaybackRate(note);
      source.playbackRate.value = playbackRate;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 1.0;

      source.connect(gainNode);
      gainNode.connect(this.masterGain);

      source.start(0);

      // CHANGED: Store with timestamp to track multiple instances
      const instanceKey = key + '_' + Date.now();
      this.activeNotes.set(instanceKey, { source, gainNode, startTime: Date.now() });

      source.onended = () => {
        this.activeNotes.delete(instanceKey);
      };

      console.log('Playing note:', note, 'at playback rate:', playbackRate.toFixed(3));
    } catch (error) {
      console.error('Error playing note:', note, error);
    }
  }

  stopNote(note, stringId = null) {
    const key = stringId || note;
    const noteData = this.activeNotes.get(key);
    if (noteData) {
      const { source, gainNode } = noteData;
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
      source.stop(now + 0.05);
      this.activeNotes.delete(key);
    }
  }

  panic() {
    // Stop all currently playing notes
    console.log('Panic: stopping all notes');
    this.activeNotes.forEach((noteData, note) => {
      try {
        noteData.source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    });
    this.activeNotes.clear();
  }

  // Legacy method for compatibility (not needed in Web Audio API implementation)
  cleanupOrphanedOscillators() {
    // No-op - Web Audio handles cleanup automatically
  }

  get activeOscillators() {
    // For compatibility with existing code that checks this
    return this.activeNotes;
  }
}