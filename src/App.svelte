<script>
  import { onMount } from 'svelte';
  import ResponsiveContainer from './lib/ResponsiveContainer.svelte';
  import GridContainer from './lib/GridContainer.svelte';
  import SplashScreen from './lib/SplashScreen.svelte';
  import IconButton from './lib/IconButton.svelte';
  import OptionsScreen from './lib/OptionsScreen.svelte';
  import { AudioEngine } from './lib/AudioEngine.js';

  let currentScreen = $state('splash'); // 'splash', 'play', 'about', 'options'
  let audioEngine = $state(null);
  let audioInitialized = false;

  // Settings for the harp
  let settings = $state(loadSavedSettings());

  function loadSavedSettings() {
    const saved = localStorage.getItem('harp-settings');
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
      topRow: { root: 'G', chordType: 'major', octave: 3, visible: true },
      middleRow: { root: 'F', chordType: 'major', octave: 3, visible: true },
      bottomRow: { root: 'C', chordType: 'major', octave: 3 },
      reverb: true
    };
  }

  onMount(() => {
    // Create audio engine immediately (but don't initialize yet)
    audioEngine = new AudioEngine();
  });

  async function handleSplashClick() {
  document.body.style.setProperty('background-color', 'rgb(86, 180, 233)', 'important');
  
  // Initialize audio context on user interaction (required for iOS)
  if (audioEngine && !audioInitialized) {
    await audioEngine.init();
    audioInitialized = true;
    console.log('Audio initialized from splash screen');
  }
  
  // Show play screen
  currentScreen = 'play';
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
    // Get all active notes and stop them gracefully (with release envelope)
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
    currentScreen = 'play';

    // CHROME iOS FIX: Wait for layout to settle after transition
    setTimeout(() => {
      window.scrollTo(0, 0);
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  function handleSettingsUpdate(event) {
    settings = event.detail;
    console.log('Settings updated:', settings);
    
    // Update audio engine reverb setting
    if (audioEngine) {
      audioEngine.setReverbEnabled(settings.reverb);
    }
  }

  function closeOptions() {
    document.body.style.setProperty('background-color', 'rgb(86, 180, 233)', 'important');
    currentScreen = 'play';
    
    // CHROME iOS FIX: Wait for layout to settle after transition
    setTimeout(() => {
      window.scrollTo(0, 0);
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
</script>

{#if currentScreen === 'splash'}
  <SplashScreen 
    title="Lines"
    instructions="To play: touch or click screen or use computer keyboard keys"
    footerNote="On Apple devices, turn off silent mode"
    on:click={handleSplashClick}
  />
{:else if currentScreen === 'about'}
  <SplashScreen 
    title="Lines"
    instructions="To play: touch or click screen or use computer keyboard keys"
    footerNote="On Apple devices, turn off silent mode"
    on:click={handleAboutClose}
  />
{:else if currentScreen === 'options'}
  <OptionsScreen 
      on:updateSettings={handleSettingsUpdate}
      on:close={closeOptions} 
  />
{:else if currentScreen === 'play'}
  <!-- Icon buttons positioned in top corners -->
  <div style="position: fixed; top: 20px; left: 20px; z-index: 1000;">
    <IconButton 
      type="info" 
      ariaLabel="About"
      on:click={handleAboutClick}
    />
  </div>
  
  <div style="position: fixed; top: 20px; right: 65px; z-index: 1000;">
    <IconButton 
      type="settings" 
      ariaLabel="Options"
      on:click={handleOptionsClick}
    />
  </div>

  <main>
    <ResponsiveContainer>
      <GridContainer 
        {audioEngine} 
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
