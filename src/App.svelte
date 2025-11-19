<script>
  import { onMount } from 'svelte';
  import ResponsiveContainer from './lib/ResponsiveContainer.svelte';
  import SequencerGrid from './lib/SequencerGrid.svelte';
  import SplashScreen from './lib/SplashScreen.svelte';
  import IconButton from './lib/IconButton.svelte';
  import OptionsScreen from './lib/OptionsScreen.svelte';
  import { AudioEngine } from './lib/AudioEngine.js';

  let currentScreen = $state('home'); // 'home', 'sequencer', 'about', 'options'
  let sequencerMode = $state('full'); // 'full' or 'keyboard'
  let audioEngine = $state(null);
  let audioInitialized = false;

  // Settings for the sequencer
  let settings = $state(loadSavedSettings());

  function loadSavedSettings() {
    const saved = localStorage.getItem('patterns-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('Loaded saved settings on startup:', parsed);
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    
    // Return defaults if nothing saved
    return {
      key: 'C',
      scale: 'major',
      octave: 2,
      bpm: 99,
      reverb: true
    };
  }

  onMount(() => {
    // Create audio engine immediately (but don't initialize yet)
    audioEngine = new AudioEngine();
  });

  function handleModeSelect(event) {
    const { mode } = event.detail;
    sequencerMode = mode;
    console.log('Mode selected:', mode);
    handleSequencerStart();
  }

  async function handleSequencerStart() {
    document.body.style.setProperty('background-color', 'rgb(86, 180, 233)', 'important');
    
    // Initialize audio context on user interaction (required for iOS)
    if (audioEngine && !audioInitialized) {
      await audioEngine.init();
      audioInitialized = true;
      console.log('Audio initialized');
    }
    
    // Show sequencer screen
    currentScreen = 'sequencer';
    console.log('Current screen set to:', currentScreen);
    
    // CHROME iOS FIX: Wait for layout to settle after transition
    setTimeout(() => {
      window.scrollTo(0, 0);
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  function gracefullyStopAllNotes() {
    // Placeholder for when we add audio in Phase 2
    if (audioEngine && audioEngine.activeOscillators) {
      var activeNotes = Array.from(audioEngine.activeOscillators.keys());
      activeNotes.forEach(function(note) {
        audioEngine.stopNote(note);
      });
      console.log('Gracefully stopped all notes');
    }
  }

  function handleAboutClick() {
    gracefullyStopAllNotes();
    document.body.style.setProperty('background-color', 'white', 'important');
    currentScreen = 'about';
  }

  function handleOptionsClick() {
    gracefullyStopAllNotes();
    document.body.style.setProperty('background-color', 'white', 'important');
    currentScreen = 'options';
  }

  function handleAboutClose() {
    document.body.style.setProperty('background-color', 'rgb(86, 180, 233)', 'important');
    currentScreen = 'sequencer';

    // CHROME iOS FIX: Wait for layout to settle after transition
    setTimeout(() => {
      window.scrollTo(0, 0);
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
  
  function handleHomeClick() {
    gracefullyStopAllNotes();
    document.body.style.setProperty('background-color', 'white', 'important');
    currentScreen = 'home';
  }

  function handleSettingsUpdate(event) {
    settings = event.detail;
    console.log('Settings updated:', settings);
    
    // Update audio engine reverb setting
    if (audioEngine) {
      audioEngine.setReverbEnabled(settings.reverb);
    }
    
    // Save to localStorage
    localStorage.setItem('patterns-settings', JSON.stringify(settings));
  }

  function closeOptions() {
    document.body.style.setProperty('background-color', 'rgb(86, 180, 233)', 'important');
    currentScreen = 'sequencer';
    
    // CHROME iOS FIX: Wait for layout to settle after transition
    setTimeout(() => {
      window.scrollTo(0, 0);
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
</script>

{#if currentScreen === 'home'}
  <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: white; z-index: 9999;">
    <ResponsiveContainer>
      <SplashScreen 
        title="Patterns"
        instructions="Create musical patterns by clicking steps to activate them, then press play to hear your sequence loop."
        footerNote="On Apple devices, turn off silent mode"
        showModeButtons={true}
        on:selectMode={handleModeSelect}
      />
    </ResponsiveContainer>
  </div>
{:else if currentScreen === 'about'}
  <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: white; z-index: 9999;">
    <ResponsiveContainer>
      <SplashScreen 
        title="Patterns"
        instructions="Create musical patterns by clicking steps to activate them, then press play to hear your sequence loop."
        footerNote="On Apple devices, turn off silent mode"
        showModeButtons={false}
        on:click={handleAboutClose}
      />
    </ResponsiveContainer>
  </div>
{:else if currentScreen === 'options'}
  <OptionsScreen 
      on:updateSettings={handleSettingsUpdate}
      on:close={closeOptions} 
  />
{:else if currentScreen === 'sequencer'}
  <!-- Icon buttons positioned in top corners -->
  <div style="position: fixed; top: 20px; left: 20px; z-index: 1000;">
    <IconButton 
      type="info" 
      ariaLabel="About"
      on:click={handleAboutClick}
    />
  </div>
  
  <div style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
    <IconButton 
      type="settings" 
      ariaLabel="Options"
      on:click={handleOptionsClick}
    />
  </div>

  <main>
    <ResponsiveContainer>
      <SequencerGrid 
        mode={sequencerMode}
        {settings}
      />
    </ResponsiveContainer>
  </main>
{/if}

<style>
  main {
    text-align: center;
    padding: 1em;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    margin: 0;
  }


  @media (orientation: landscape) and (max-height: 500px) {
    main {
        padding: 0.5em;
      }
    }
</style>