<script>
  import { onMount, onDestroy } from 'svelte';
  import Step from './Step.svelte';
  import { ArpeggioGenerator } from './ArpeggioGenerator';
  
  let { mode = 'full', settings = { key: 'C', scale: 'major', octave: 2 } } = $props();

  const STEPS_PER_ROW = 8;
  
  // Define rows based on mode
  let numRows = $derived(mode === 'full' ? 10 : 4);
  let numHarpRows = $derived(mode === 'full' ? 7 : 4);
  let numDrumRows = $derived(mode === 'full' ? 3 : 0);
  
  // Initialize grid state - 2D array [row][step]
  let grid = $state([]);
  
  // Currently playing step (for visual feedback, -1 means not playing)
  let currentStep = $state(-1);
  
  // Arpeggio generator for harp notes
  const arpeggioGenerator = new ArpeggioGenerator();
  
  // Generate notes for harp rows based on settings
  let harpNotes = $derived(generateHarpNotes(settings.key, settings.scale, settings.octave, numHarpRows));
  
  // Drum notes (fixed)
  const drumNotes = ['C4', 'D4', 'E4']; // kick, snare, woodblock
  
  // Initialize grid when mode changes
  $effect(() => {
    initializeGrid(numRows);
  });
  
  function initializeGrid(rows) {
    grid = Array(rows).fill(null).map(() => 
      Array(STEPS_PER_ROW).fill(false)
    );
  }
  
  function generateHarpNotes(key, scaleType, octave, rows) {
    const notes = [];
    for (let i = 0; i < rows; i++) {
      // Generate arpeggio for this row
      // For now, using major scale - we'll add scale selection in Phase 3
      const arpeggio = arpeggioGenerator.generateArpeggio(key, 'major', octave, STEPS_PER_ROW);
      notes.push(arpeggio);
    }
    return notes;
  }
  
  function handleStepToggle(event) {
    const { rowIndex, stepIndex } = event.detail;
    grid[rowIndex][stepIndex] = !grid[rowIndex][stepIndex];
    console.log(`Toggled step [${rowIndex}][${stepIndex}] to ${grid[rowIndex][stepIndex]}`);
  }
  
  function getStepLabel(rowIndex, stepIndex) {
    if (rowIndex < numHarpRows) {
      return `Harp row ${rowIndex + 1}, step ${stepIndex + 1}`;
    } else {
      const drumNames = ['Kick', 'Snare', 'Woodblock'];
      return `${drumNames[rowIndex - numHarpRows]}, step ${stepIndex + 1}`;
    }
  }
  
  onMount(() => {
    console.log('SequencerGrid mounted in', mode, 'mode');
  });
</script>

<div class="sequencer-grid">
  {#each Array(numRows) as _, rowIndex}
    <div class="row" class:drum-row={rowIndex >= numHarpRows}>
      {#each Array(STEPS_PER_ROW) as _, stepIndex}
        <Step
          {rowIndex}
          {stepIndex}
          isActive={grid[rowIndex]?.[stepIndex] || false}
          isPlaying={currentStep === stepIndex}
          instrumentType={rowIndex < numHarpRows ? 'harp' : 'drum'}
          label={getStepLabel(rowIndex, stepIndex)}
          on:toggle={handleStepToggle}
        />
      {/each}
    </div>
  {/each}
</div>

<style>
  .sequencer-grid {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
    border-radius: 20px;
    overflow: hidden;
  }
  
  .row {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    padding: 0 2vw;
    position: relative;
    background-color: rgb(86, 180, 233);
  }
  
  .drum-row {
    background-color: rgb(230, 159, 0);
  }

  /* Portrait orientation - use vw for sizing */
  @media (orientation: portrait) {
    .row {
      padding: 0 1.5vw;
    }
  }

  /* Landscape orientation - use vh for sizing */
  @media (orientation: landscape) {
    .row {
      padding: 0 1.5vh;
    }
  }

  @media (max-width: 480px) {
    .row {
      padding: 0 1vw;
    }
  }

  @media (orientation: landscape) and (max-height: 500px) {
    .row {
      padding: 0 0.5vh;
    }
  }
</style>