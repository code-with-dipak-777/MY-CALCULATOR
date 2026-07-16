/**
 * Glassmorphic Calculator Core Logic
 */

class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    /**
     * Resets the calculator state
     */
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.scientificFormula = '';
        this.pendingScientificOperation = undefined;
    }

    /**
     * Deletes the last character from current operand
     */
    delete() {
        this.scientificFormula = '';
        if (this.currentOperand === '0' || this.currentOperand === 'Error') {
            this.currentOperand = '0';
            return;
        }
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    /**
     * Appends a digit or decimal point to the display
     */
    appendNumber(number) {
        if (!this.pendingScientificOperation) {
            this.scientificFormula = '';
        }
        if (this.currentOperand === 'Error') {
            this.currentOperand = '0';
        }
        // Prevent multiple decimals
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Handle initial zero inputs
        if (this.currentOperand === '0') {
            if (number === '00' || number === '0') return; // Do nothing for multiple leading zeroes
            if (number !== '.') {
                this.currentOperand = number.toString();
                return;
            }
        }
        
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    /**
     * Appends mathematical constants like Pi or e
     */
    appendConstant(constant) {
        this.scientificFormula = '';
        if (constant === 'pi') {
            this.currentOperand = Math.PI.toString();
        } else if (constant === 'e') {
            this.currentOperand = Math.E.toString();
        }
    }

    /**
     * Selects an operator for the calculation
     */
    chooseOperation(operation) {
        this.scientificFormula = '';
        this.pendingScientificOperation = undefined;
        if (this.currentOperand === 'Error') return;
        
        // Allow user to change operator if they clicked the wrong one
        if (this.currentOperand === '') {
            if (this.previousOperand !== '') {
                this.operation = operation;
            }
            return;
        }

        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    /**
     * Performs a unary scientific mathematical operation on the current operand
     */
    scientificOperation(type) {
        if (this.currentOperand === 'Error') return;

        if (this.pendingScientificOperation && this.currentOperand !== '0' && this.currentOperand !== '') {
            this.applyPendingScientificOperation();
        }

        if (this.pendingScientificOperation === undefined && this.currentOperand !== '' && this.currentOperand !== '0') {
            const current = parseFloat(this.currentOperand);
            if (isNaN(current)) return;
            this.applyScientificOperation(type, current);
            return;
        }

        this.pendingScientificOperation = type;
        let label = type;
        if (type === 'sqrt') label = '√';
        this.scientificFormula = label;
        this.currentOperand = '0';
        this.operation = undefined;
        this.previousOperand = '';
    }

    applyScientificOperation(type, currentValue) {
        let result;
        switch (type) {
            case 'sin':
                result = Math.sin((currentValue * Math.PI) / 180);
                break;
            case 'cos':
                result = Math.cos((currentValue * Math.PI) / 180);
                break;
            case 'tan':
                if (Math.abs(currentValue % 180) === 90) {
                    result = 'Error';
                } else {
                    result = Math.tan((currentValue * Math.PI) / 180);
                }
                break;
            case 'sqrt':
                if (currentValue < 0) {
                    result = 'Error';
                } else {
                    result = Math.sqrt(currentValue);
                }
                break;
            case 'log':
                if (currentValue <= 0) {
                    result = 'Error';
                } else {
                    result = Math.log10(currentValue);
                }
                break;
            case 'ln':
                if (currentValue <= 0) {
                    result = 'Error';
                } else {
                    result = Math.log(currentValue);
                }
                break;
            case 'factorial':
                if (currentValue < 0 || !Number.isInteger(currentValue)) {
                    result = 'Error';
                } else {
                    result = this.calculateFactorial(currentValue);
                }
                break;
            default:
                return;
        }

        if (typeof result === 'number') {
            result = Math.round(result * 1e12) / 1e12;
        }

        let formulaSymbol = type;
        if (type === 'sqrt') formulaSymbol = '√';
        this.scientificFormula = `${formulaSymbol}(${this.getDisplayNumber(currentValue.toString())})`;
        this.currentOperand = result.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.pendingScientificOperation = undefined;
    }

    applyPendingScientificOperation() {
        if (!this.pendingScientificOperation) return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.applyScientificOperation(this.pendingScientificOperation, current);
    }

    /**
     * Computes the factorial of a number
     */
    calculateFactorial(n) {
        if (n === 0 || n === 1) return 1;
        if (n > 170) return Infinity; // Limit to standard JS float range
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    /**
     * Computes the math expression
     */
    compute() {
        this.scientificFormula = '';
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    computation = 'Error';
                } else {
                    computation = prev / current;
                }
                break;
            case '%':
                computation = prev % current;
                break;
            case '^':
                computation = Math.pow(prev, current);
                break;
            default:
                return;
        }

        // Avoid floating point precision issues (e.g. 0.1 + 0.2 = 0.30000000000000004)
        if (typeof computation === 'number') {
            computation = Math.round(computation * 1e12) / 1e12;
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    /**
     * Helper to format numbers with commas for thousand separators
     */
    getDisplayNumber(number) {
        if (number === 'Error') return 'Error';
        if (number === 'Infinity') return 'Infinity';
        if (number === '-Infinity') return '-Infinity';
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    /**
     * Updates display elements in DOM
     */
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        
        if (this.scientificFormula) {
            this.previousOperandTextElement.innerText = this.scientificFormula;
        } else if (this.operation != null) {
            let opSymbol = this.operation;
            if (this.operation === '*') opSymbol = '×';
            if (this.operation === '/') opSymbol = '÷';
            if (this.operation === '+') opSymbol = '+';
            if (this.operation === '-') opSymbol = '−';
            if (this.operation === '^') opSymbol = '^';
            this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${opSymbol}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }

        // Dynamically shrink text size if it's too long to prevent overflow
        const len = this.currentOperandTextElement.innerText.length;
        if (len > 12) {
            this.currentOperandTextElement.style.fontSize = '1.4rem';
        } else if (len > 8) {
            this.currentOperandTextElement.style.fontSize = '1.8rem';
        } else {
            this.currentOperandTextElement.style.fontSize = '2.25rem';
        }
    }
}

/* ==========================================================================
   DOM Elements & Initialization
   ========================================================================== */
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('#equals');
const deleteButton = document.querySelector('#delete');
const clearButton = document.querySelector('#clear');
const previousOperandTextElement = document.querySelector('#previous-operand');
const currentOperandTextElement = document.querySelector('#current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Number click handlers
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.getAttribute('data-number'));
        calculator.updateDisplay();
    });
});

// Operator click handlers
operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.getAttribute('data-operator'));
        calculator.updateDisplay();
    });
});

// Scientific buttons click handlers
const sciButtons = document.querySelectorAll('[data-sci]');
sciButtons.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.getAttribute('data-sci');
        if (type === 'pow') {
            calculator.chooseOperation('^');
        } else if (type === 'pi' || type === 'e') {
            calculator.appendConstant(type);
        } else {
            calculator.scientificOperation(type);
        }
        calculator.updateDisplay();
    });
});

// Equals click handler
equalsButton.addEventListener('click', () => {
    if (calculator.pendingScientificOperation) {
        calculator.applyPendingScientificOperation();
    } else {
        calculator.compute();
    }
    calculator.updateDisplay();
});

// Clear click handler
clearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

// Delete click handler
deleteButton.addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

/* ==========================================================================
   Sound System (Web Audio API Synthesizer)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

const soundToggle = document.getElementById('sound-toggle');
if (soundToggle) {
    if (soundEnabled) {
        soundToggle.classList.remove('sound-off');
        soundToggle.classList.add('sound-on');
    } else {
        soundToggle.classList.remove('sound-on');
        soundToggle.classList.add('sound-off');
    }

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('soundEnabled', soundEnabled);
        if (soundEnabled) {
            soundToggle.classList.remove('sound-off');
            soundToggle.classList.add('sound-on');
            playClickSound();
        } else {
            soundToggle.classList.remove('sound-on');
            soundToggle.classList.add('sound-off');
        }
    });
}

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playClickSound() {
    if (!soundEnabled) return;
    try {
        initAudioContext();
        const now = audioCtx.currentTime;
        
        // Pitch of key click
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Mechanical friction high-pass click sound
        const bufferSize = audioCtx.sampleRate * 0.008;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(5000, now);
        
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.02, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.006);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + 0.05);
        noise.start(now);
        noise.stop(now + 0.008);
    } catch (err) {
        console.warn("Audio context error:", err);
    }
}

// Attach sound trigger to all clickable interactive items
document.querySelectorAll('.btn, .theme-btn, .sci-btn, .sound-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.id !== 'sound-toggle') {
            playClickSound();
        }
    });
});

/* ==========================================================================
   Keyboard Support
   ========================================================================== */
window.addEventListener('keydown', e => {
    let key = e.key;
    let button;

    // Map keyboard inputs to calculator buttons
    if (key >= '0' && key <= '9') {
        button = document.querySelector(`[data-number="${key}"]`);
    } else if (key === '.') {
        button = document.querySelector(`[data-number="."]`);
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') {
        button = document.querySelector(`[data-operator="${key}"]`);
    } else if (key === '^') {
        button = document.querySelector('[data-sci="pow"]');
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault(); // Prevent submitting forms or scrolling
        button = equalsButton;
    } else if (key === 'Backspace') {
        button = deleteButton;
    } else if (key === 'Escape') {
        button = clearButton;
    }

    if (button) {
        button.click();
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 100);
    }
});

/* ==========================================================================
   Theme Toggle System
   ========================================================================== */
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Load preferred theme
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
} else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
}

themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
});

/* ==========================================================================
   Scientific Mode Toggle
   ========================================================================== */
const sciToggle = document.getElementById('sci-toggle');
const container = document.querySelector('.calculator-container');

// Load preferred scientific mode
const savedMode = localStorage.getItem('calcMode') || 'standard';
if (savedMode === 'scientific') {
    container.classList.add('scientific-active');
} else {
    container.classList.remove('scientific-active');
}

sciToggle.addEventListener('click', () => {
    container.classList.toggle('scientific-active');
    const isActive = container.classList.contains('scientific-active');
    localStorage.setItem('calcMode', isActive ? 'scientific' : 'standard');
});
