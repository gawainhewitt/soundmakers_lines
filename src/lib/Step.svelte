<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let { 
    rowIndex = 0,
    stepIndex = 0,
    isActive = false,
    isPlaying = false,
    instrumentType = 'harp',
    label = ''
  } = $props();
  
  function handleClick() {
    dispatch('toggle', { rowIndex, stepIndex });
  }
</script>

<button
  class="step"
  class:active={isActive}
  class:playing={isPlaying}
  class:active-playing={isActive && isPlaying}
  class:drum={instrumentType === 'drum'}
  onclick={handleClick}
  aria-label={label}
  type="button"
>
</button>

<style>
  .step {
    /* iOS 12 compatible sizing - use padding-bottom trick instead of aspect-ratio */
    width: 100%;
    padding: 0;
    position: relative;
    border: none;
    border-radius: 7px;
    background-color: #ccc;
    cursor: pointer;
    transition: all 0.1s ease;
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
  }
  
  /* iOS 12 compatible aspect ratio using padding-bottom */
  .step::before {
    content: '';
    display: block;
    padding-bottom: 100%; /* Creates 1:1 aspect ratio */
  }
  
  /* Inactive state - light gray */
  .step {
    background-color: #ccc;
  }
  
  /* Active state - purple */
  .step.active {
    background-color: #600889;
  }
  
  /* Currently playing step - bright cyan */
  .step.playing {
    background-color: #05f18f;
  }
  
  /* Active AND playing - yellow */
  .step.active-playing {
    background-color: #ffeb3b;
  }
  
  .step:hover {
    opacity: 0.9;
  }
  
  .step:active {
    opacity: 0.7;
  }
  
  .step:focus {
    outline: 2px solid #333;
    outline-offset: 2px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 480px) {
    .step {
      border-radius: 5px;
    }
  }
</style>