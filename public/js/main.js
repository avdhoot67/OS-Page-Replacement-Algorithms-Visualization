// DOM Elements
const referenceStringInput = document.getElementById('reference-string');
const numFramesInput = document.getElementById('num-frames');
const algorithmSelect = document.getElementById('algorithm');
const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const runBtn = document.getElementById('run-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const currentPageEl = document.getElementById('current-page');
const pageFaultsEl = document.getElementById('page-faults');
const referenceSequenceEl = document.getElementById('reference-sequence');
const framesContainerEl = document.getElementById('frames-container');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const errorMessageEl = document.getElementById('error-message');
const errorTextEl = errorMessageEl.querySelector('.error-text');

// Simulation variables
let referenceString = [];
let frames = [];
let currentIndex = 0;
let pageFaults = 0;
let hits = 0;
let simulationSpeed = 1.5;
let isRunning = false;
let animationTimeout = null;

// Add a debounce mechanism to prevent rapid clicks
let debounceTimer = null;
function debounce(func, delay = 300) {
    return function() {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const context = this;
        const args = arguments;
        debounceTimer = setTimeout(() => {
            func.apply(context, args);
            debounceTimer = null;
        }, delay);
    };
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    console.log('Run button:', runBtn);
    console.log('Pause button:', pauseBtn);
    console.log('Reset button:', resetBtn);
    
    // Verify all elements are properly found
    if (!runBtn || !pauseBtn || !resetBtn || !referenceStringInput || !numFramesInput) {
        console.error('Some DOM elements could not be found');
        // Try to find elements again with a slight delay
        setTimeout(() => {
            console.log('Retrying to find elements...');
            const runBtnRetry = document.getElementById('run-btn');
            console.log('Run button retry:', runBtnRetry);
            if (runBtnRetry) {
                runBtnRetry.addEventListener('click', function(e) {
                    console.log('Run button clicked!', e);
                    startSimulation();
                });
            }
        }, 1000);
    }
    
    // Initialize the application
    init();
    
    // Direct click handler to debug issues
    if (runBtn) {
        runBtn.onclick = function(e) {
            console.log('Run button onclick event triggered', e);
            startSimulation();
        };
    }
    
    // Add event listeners again to ensure they're attached
    runBtn && runBtn.addEventListener('click', startSimulation);
    pauseBtn && pauseBtn.addEventListener('click', togglePause);
    resetBtn && resetBtn.addEventListener('click', resetSimulation);
    speedInput && speedInput.addEventListener('input', updateSpeed);
    
    // Backup click handler for all buttons
    document.addEventListener('click', function(e) {
        if (e.target.id === 'run-btn' || e.target.closest('#run-btn')) {
            console.log('Run button clicked through event delegation');
            startSimulation();
        }
    });
});

// Tab Functionality
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Update displayed speed value
function updateSpeed() {
    simulationSpeed = parseFloat(speedInput.value);
    speedValue.textContent = `${simulationSpeed}x`;
}

// Show error message
function showError(message) {
    errorTextEl.textContent = message;
    errorMessageEl.classList.add('show');
    setTimeout(() => {
        errorMessageEl.classList.remove('show');
    }, 5000);
}

// Start simulation
function startSimulation() {
    console.log('Start simulation called');
    
    try {
        if (isRunning) {
            console.log('Simulation already running');
            return;
        }
        
        // Parse input values
        const stringInput = referenceStringInput.value.trim();
        console.log('Reference string input:', stringInput);
        
        if (!stringInput) {
            showError('Please enter a reference string');
            return;
        }

        // Validate reference string
        const hasNumbers = /\d/.test(stringInput);
        const hasLetters = /[a-zA-Z]/.test(stringInput);
        const hasSpecialChars = /[^a-zA-Z0-9\s]/.test(stringInput);

        if (hasNumbers && hasLetters) {
            showError('Reference string cannot contain both numbers and letters. Please use either numbers or letters only.');
            return;
        }

        if (hasSpecialChars) {
            showError('Reference string cannot contain special characters or symbols. Please use only numbers or letters.');
            return;
        }
        
        referenceString = stringInput.split(/\s+/);
        console.log('Parsed reference string:', referenceString);
        
        const numFrames = parseInt(numFramesInput.value);
        console.log('Number of frames:', numFrames);
        
        if (isNaN(numFrames) || numFrames < 1) {
            alert('Please enter a valid number of frames');
            return;
        }
        
        // Reset simulation state
        frames = [];
        currentIndex = 0;
        pageFaults = 0;
        hits = 0;
        framesContainerEl.innerHTML = '';
        
        // Update UI
        updateStats();
        displayReferenceSequence();
        
        // Start the simulation
        isRunning = true;
        runBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        
        console.log('Running first step');
        // Run the first step immediately
        runNextStep();
    } catch (error) {
        console.error('Error in startSimulation:', error);
        showError('An error occurred while starting the simulation. Please check the console for details.');
    }
}

// Toggle pause/resume with debounce
const debouncedTogglePause = debounce(function() {
    console.log('Toggle pause called (debounced)');
    togglePauseImpl();
}, 300);

// The actual pause implementation
function togglePauseImpl() {
    if (isRunning) {
        // Pause simulation
        console.log('Pausing simulation');
        isRunning = false;
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        
        // Clear any scheduled steps
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
        
        // Add paused class to the container
        framesContainerEl.classList.add('paused');
        
        // Force stop all animations
        const animatedElements = document.querySelectorAll('.frame-cell, .frame-row');
        animatedElements.forEach(el => {
            // Remove animation classes
            el.classList.remove('animating');
            // Force CSS animations to stop
            el.style.animation = 'none';
            el.style.transition = 'none';
            // Force reflow to apply the changes immediately
            void el.offsetWidth;
        });
        
        console.log('Simulation paused successfully');
    } else {
        // Resume simulation
        console.log('Resuming simulation');
        isRunning = true;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        // Remove paused class
        framesContainerEl.classList.remove('paused');
        
        // Only run next step if there's no existing timeout
        if (!animationTimeout && currentIndex < referenceString.length) {
            console.log('Running next step after resume');
            runNextStep();
        }
    }
}

// Replace the original togglePause function
function togglePause() {
    // Call the debounced version to prevent rapid clicks
    debouncedTogglePause();
}

// Reset simulation
function resetSimulation() {
    console.log('Reset simulation called');
    
    isRunning = false;
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
    
    // Reset UI
    runBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    
    // Clear visualization
    currentPageEl.textContent = '-';
    pageFaultsEl.textContent = '0';
    referenceSequenceEl.innerHTML = '';
    framesContainerEl.innerHTML = '';
    
    console.log('Simulation reset complete');
}

// Display the reference sequence
function displayReferenceSequence() {
    console.log('Displaying reference sequence');
    referenceSequenceEl.innerHTML = '';
    
    referenceString.forEach((page, index) => {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';
        pageItem.textContent = page;
        pageItem.dataset.index = index;
        referenceSequenceEl.appendChild(pageItem);
    });
    
    console.log('Reference sequence display complete');
}

// Update statistics display
function updateStats() {
    currentPageEl.textContent = currentIndex < referenceString.length ? referenceString[currentIndex] : '-';
    pageFaultsEl.textContent = pageFaults;
    
    // Highlight current page in reference sequence
    const pageItems = referenceSequenceEl.querySelectorAll('.page-item');
    if (pageItems && pageItems.length > 0) {
        pageItems.forEach(item => {
            item.classList.remove('current');
            if (parseInt(item.dataset.index) < currentIndex) {
                item.classList.add('visited');
            }
        });
        
        if (currentIndex < referenceString.length && currentIndex < pageItems.length) {
            pageItems[currentIndex].classList.add('current');
        }
    }
}

// Process the next page reference
function runNextStep() {
    try {
        console.log('Running next step, index:', currentIndex, 'of', referenceString.length);
        
        if (!isRunning || currentIndex >= referenceString.length) {
            if (currentIndex >= referenceString.length) {
                console.log('Simulation complete');
                runBtn.disabled = false;
                pauseBtn.disabled = true;
                isRunning = false;
                if (animationTimeout) {
                    clearTimeout(animationTimeout);
                    animationTimeout = null;
                }
                // Display final statistics when simulation completes
                displayFinalStatistics();
            }
            return;
        }
        
        // Clear any existing timeout before creating a new one
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
        
        const page = referenceString[currentIndex];
        console.log('Processing page:', page);
        const algorithm = algorithmSelect.value;
        console.log('Using algorithm:', algorithm);
        
        // Check if page is already in frames (cache hit)
        if (frames.includes(page)) {
            console.log('Cache hit for page:', page);
            hits++;
            
            // For LRU, move the page to the end of the array (most recently used)
            if (algorithm === 'LRU') {
                const index = frames.indexOf(page);
                frames.splice(index, 1);
                frames.push(page);
                console.log('LRU: Moved page', page, 'to end (most recently used)');
            }
            
            // For MRU, move the page to the end of the array
            if (algorithm === 'MRU') {
                const index = frames.indexOf(page);
                frames.splice(index, 1);
                frames.push(page);
                console.log('MRU: Moved page', page, 'to end (most recently used)');
            }
            
            // Display hit state
            displayFrameState(page, 'hit');
        } else {
            // Page fault
            console.log('Page fault for page:', page);
            pageFaults++;
            
            if (frames.length < parseInt(numFramesInput.value)) {
                // If there's space, add the page
                console.log('Adding page to empty frame');
                frames.push(page);
                
                // Display new frame with animation
                displayFrameState(page, 'new');
            } else {
                // No space, use replacement algorithm
                console.log('Frame full, using replacement algorithm');
                let replacedPage;
                
                try {
                    switch (algorithm) {
                        case 'FIFO':
                            // Remove the oldest page (front of the queue)
                            replacedPage = frames.shift();
                            frames.push(page);
                            console.log('FIFO: Replaced page', replacedPage, 'with', page);
                            break;
                            
                        case 'LRU':
                            // For proper LRU, the least recently used page is at the front of the array
                            // Since we move accessed pages to the end, the front has the LRU page
                            replacedPage = frames.shift();
                            frames.push(page);
                            console.log('LRU: Replaced page', replacedPage, 'with', page);
                            break;
                            
                        case 'OPTIMAL':
                            // Find the page that won't be used for the longest time
                            let farthestIndex = -1;
                            let farthestPage = null;
                            
                            for (let i = 0; i < frames.length; i++) {
                                const frame = frames[i];
                                // Find the next occurrence of this frame in the future
                                let nextOccurrence = -1;
                                
                                for (let j = currentIndex + 1; j < referenceString.length; j++) {
                                    if (referenceString[j] === frame) {
                                        nextOccurrence = j;
                                        break;
                                    }
                                }
                                
                                // If this page won't be used again, or will be used farthest in the future
                                if (nextOccurrence === -1) {
                                    // This page won't be used again, so replace it
                                    farthestPage = frame;
                                    break;
                                } else if (nextOccurrence > farthestIndex) {
                                    farthestIndex = nextOccurrence;
                                    farthestPage = frame;
                                }
                            }
                            
                            // Replace the page
                            replacedPage = farthestPage || frames[0]; // Fallback to first page if nothing found
                            const replaceIndex = frames.indexOf(replacedPage);
                            frames[replaceIndex] = page;
                            console.log('OPTIMAL: Replaced page', replacedPage, 'with', page);
                            break;
                            
                        case 'MRU':
                            // Remove the most recently used page (end of the array)
                            replacedPage = frames.pop();
                            frames.push(page);
                            console.log('MRU: Replaced page', replacedPage, 'with', page);
                            break;
                            
                        default:
                            console.error('Unknown algorithm:', algorithm);
                            replacedPage = frames[0];
                            frames[0] = page;
                    }
                } catch (error) {
                    console.error('Error in replacement algorithm:', error);
                    // Fallback replacement
                    replacedPage = frames[0];
                    frames[0] = page;
                }
                
                // Display replaced frame with animation
                displayFrameState(page, 'replaced', replacedPage);
            }
        }
        
        // Update UI
        updateStats();
        
        // Move to the next page
        currentIndex++;
        
        // Schedule the next step only if simulation is still running
        if (isRunning) {
            const delayTime = Math.floor(2000 / simulationSpeed);
            console.log('Scheduling next step in', delayTime, 'ms');
            animationTimeout = setTimeout(() => {
                if (isRunning) {  // Double check if still running
                    runNextStep();
                }
            }, delayTime);
        }
    } catch (error) {
        console.error('Error in runNextStep:', error);
        // Attempt to recover
        isRunning = false;
        runBtn.disabled = false;
        pauseBtn.disabled = true;
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
        showError('An error occurred during simulation. Check console for details.');
    }
}

// Display the current state of frames
function displayFrameState(newPage, state, replacedPage = null) {
    try {
        console.log('Displaying frame state. New page:', newPage, 'State:', state);
        
        if (!framesContainerEl) {
            console.error('Frames container element not found');
            return;
        }
        
        // Create a new frame row
        const frameRow = document.createElement('div');
        frameRow.className = 'frame-row';
        
        // If paused, add no-animation class
        if (!isRunning) {
            frameRow.classList.add('no-animation');
        }
        
        // Create a timestamp label
        const timeLabel = document.createElement('div');
        timeLabel.className = 'frame-label';
        
        // Add specific classes based on state
        if (state === 'hit') {
            timeLabel.classList.add('hit-label');
        } else if (state === 'new') {
            timeLabel.classList.add('new-label');
        } else if (state === 'replaced') {
            timeLabel.classList.add('replaced-label');
        } else {
            timeLabel.classList.add('fault-label');
        }
        
        // Use step number for better readability
        timeLabel.textContent = `${(currentIndex + 1)}`;
        // Add tooltip to show more details
        timeLabel.title = `Step ${currentIndex + 1}: ${state === 'hit' ? 'Cache Hit' : 'Page Fault'}`;
        frameRow.appendChild(timeLabel);
        
        // Create cells for each frame
        if (frames && frames.length > 0) {
            frames.forEach(frame => {
                const frameCell = document.createElement('div');
                frameCell.className = 'frame-cell';
                frameCell.textContent = frame;
                
                // Add classes for animations (only if running)
                if (isRunning) {
                    if (state === 'new' && frame === newPage) {
                        frameCell.classList.add('new', 'fault');
                    } else if (state === 'replaced' && frame === newPage) {
                        frameCell.classList.add('replaced', 'fault');
                        frameCell.setAttribute('data-replaced', replacedPage || '');
                    } else if (state === 'hit' && frame === newPage) {
                        frameCell.classList.add('hit');
                    }
                } else {
                    // Add classes without animations
                    frameCell.classList.add('no-animation');
                    if (state === 'new' && frame === newPage) {
                        frameCell.classList.add('new', 'fault');
                    } else if (state === 'replaced' && frame === newPage) {
                        frameCell.classList.add('replaced', 'fault');
                        frameCell.setAttribute('data-replaced', replacedPage || '');
                    } else if (state === 'hit' && frame === newPage) {
                        frameCell.classList.add('hit');
                    }
                }
                
                frameRow.appendChild(frameCell);
            });
        } else {
            console.warn('No frames to display');
            // Add empty cell as fallback
            const emptyCell = document.createElement('div');
            emptyCell.className = 'frame-cell';
            emptyCell.textContent = 'Empty';
            frameRow.appendChild(emptyCell);
        }
        
        // Add the row to the container
        framesContainerEl.appendChild(frameRow);
        
        // Scroll to the latest frame
        framesContainerEl.scrollTop = framesContainerEl.scrollHeight;
    } catch (error) {
        console.error('Error in displayFrameState:', error);
    }
}

// Helper function to create step labels
function createStepLabel(labelText) {
    const stepLabel = document.createElement('div');
    stepLabel.className = 'frame-step';
    stepLabel.textContent = labelText;
    framesContainerEl.appendChild(stepLabel);
}

// Initialize application
function init() {
    console.log('Initializing application');
    
    // Set default input values
    referenceStringInput.value = '1 3 0 3 5 6 3';
    numFramesInput.value = '3';
    speedInput.value = '1.5';
    speedValue.textContent = '1.5x';
    
    // Disable buttons initially
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    
    console.log('Application initialized with default values');
}

// Display final statistics when simulation completes
function displayFinalStatistics() {
    const total = pageFaults + hits;
    const faultRate = total === 0 ? 0 : Math.round((pageFaults / total) * 100);
    const hitRate = total === 0 ? 0 : Math.round((hits / total) * 100);
    
    // Create statistics container
    const statsContainer = document.createElement('div');
    statsContainer.className = 'final-statistics';
    
    // Create header
    const header = document.createElement('h3');
    header.textContent = 'Final Statistics';
    statsContainer.appendChild(header);
    
    // Create statistics table
    const statsTable = document.createElement('table');
    statsTable.className = 'stats-table';
    
    // Add table rows
    const rows = [
        ['Total References', referenceString.length],
        ['Page Faults', pageFaults],
        ['Cache Hits', hits],
        ['Fault Rate', `${faultRate}%`],
        ['Hit Rate', `${hitRate}%`]
    ];
    
    rows.forEach(row => {
        const tr = document.createElement('tr');
        
        const labelCell = document.createElement('td');
        labelCell.className = 'stat-label';
        labelCell.textContent = row[0];
        tr.appendChild(labelCell);
        
        const valueCell = document.createElement('td');
        valueCell.className = 'stat-value';
        valueCell.textContent = row[1];
        tr.appendChild(valueCell);
        
        statsTable.appendChild(tr);
    });
    
    statsContainer.appendChild(statsTable);
    
    // Add to frames container
    framesContainerEl.appendChild(statsContainer);
    
    // Scroll to show statistics
    framesContainerEl.scrollTop = framesContainerEl.scrollHeight;
    
    console.log('Final statistics displayed');
}

// Make functions globally available for HTML onclick attributes
window.startSimulation = startSimulation;
window.togglePause = togglePause;
window.resetSimulation = resetSimulation; 