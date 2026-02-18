// OKR data embedded directly (can also be loaded from OKRs.txt file)
const OKR_DATA = `ID | Level      | Objective          | Key Result              | OKRLink
1  | Chief      | Hire More People   | 10 More people hired    | -
2  | Chief      | Make more money    | 10 More money made      | -
3  | Manager1   | Increase Team Size | 3 people hired          | 1
4  | Manager1   | Improve Margins    | 4 more margin           | 2
5  | Manager2   | More Team Size     | 1 people hired          | 1
6  | Manager2   | Margins Better     | 2 more margin           | 2`;

// Parse OKRs from the text file or embedded data
async function loadOKRs() {
    try {
        // Try to fetch from file first (works with a local server)
        const response = await fetch('OKRs.txt', {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        if (!text || text.trim().length === 0) {
            throw new Error('OKRs.txt file is empty');
        }
        
        console.log('Successfully loaded OKRs from OKRs.txt');
        return parseOKRs(text);
    } catch (error) {
        // Fallback to embedded data if file fetch fails
        console.warn('Could not load OKRs.txt:', error.message);
        console.log('Using embedded OKR data as fallback');
        return parseOKRs(OKR_DATA);
    }
}

// Parse the OKR text data
function parseOKRs(text) {
    const lines = text.trim().split('\n');
    const okrs = [];
    
    // Skip header line (line 0) and empty lines
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse the pipe-delimited format
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 5) {
            const id = parts[0];
            const level = parts[1];
            const objective = parts[2];
            const keyResult = parts[3];
            const okrLink = parts[4];
            
            okrs.push({
                id: parseInt(id),
                level: level,
                objective: objective,
                keyResult: keyResult,
                okrLink: okrLink === '-' ? null : parseInt(okrLink)
            });
        }
    }
    
    return okrs;
}

// Create OKR card element
function createOKRCard(okr, okrs) {
    const card = document.createElement('div');
    card.className = `okr-card ${okr.level.toLowerCase().includes('chief') ? 'chief' : 'manager'}`;
    card.dataset.okrId = okr.id;
    card.dataset.okrLink = okr.okrLink || '';
    
    const levelClass = okr.level.toLowerCase().includes('chief') ? 'chief' : 'manager';
    const parentOKR = okr.okrLink ? okrs.find(o => o.id === okr.okrLink) : null;
    const linkText = parentOKR ? `🔗 Links to <strong>${parentOKR.objective}</strong>` : '';
    
    card.innerHTML = `
        <div class="okr-level ${levelClass}">${okr.level}</div>
        <div class="okr-objective">${okr.objective}</div>
        <div class="okr-key-result">${okr.keyResult}</div>
        ${linkText ? `<div class="okr-link-info">${linkText}</div>` : ''}
    `;
    
    card.addEventListener('click', () => selectOKR(okr.id));
    
    return card;
}

// Get unique manager levels from OKRs (e.g. ["Manager1", "Manager2"])
function getManagerLevels(okrs) {
    const managerOKRs = okrs.filter(okr => !okr.level.toLowerCase().includes('chief'));
    const levels = [...new Set(managerOKRs.map(o => o.level))].sort();
    return levels;
}

// Render OKRs, optionally filtered by manager level
function renderOKRs(okrs, managerFilter) {
    const chiefRow = document.getElementById('chiefRow');
    const managerRow = document.getElementById('managerRow');
    
    chiefRow.innerHTML = '';
    managerRow.innerHTML = '';
    
    const chiefOKRs = okrs.filter(okr => okr.level.toLowerCase().includes('chief'));
    let managerOKRs = okrs.filter(okr => !okr.level.toLowerCase().includes('chief'));
    
    if (managerFilter) {
        managerOKRs = managerOKRs.filter(okr => okr.level === managerFilter);
        // Show only chiefs that are linked to by this manager's OKRs
        const linkedChiefIds = new Set(managerOKRs.map(o => o.okrLink).filter(Boolean));
        const filteredChiefOKRs = chiefOKRs.filter(okr => linkedChiefIds.has(okr.id));
        
        filteredChiefOKRs.forEach(okr => {
            const card = createOKRCard(okr, okrs);
            chiefRow.appendChild(card);
        });
    } else {
        chiefOKRs.forEach(okr => {
            const card = createOKRCard(okr, okrs);
            chiefRow.appendChild(card);
        });
    }
    
    managerOKRs.forEach(okr => {
        const card = createOKRCard(okr, okrs);
        managerRow.appendChild(card);
    });
    
    setTimeout(() => {
        drawConnectionLines(okrs, managerFilter);
    }, 100);
}

// Helper function to get element position relative to wrapper
function getRelativePosition(element, wrapper) {
    let x = 0;
    let y = 0;
    let el = element;
    
    while (el && el !== wrapper && el !== document.body) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent;
    }
    
    return { x, y };
}

// Draw connection lines between Manager OKRs and their parent Chief OKRs
function drawConnectionLines(okrs, managerFilter) {
    const svg = document.getElementById('connectionLines');
    const wrapper = svg.parentElement;
    
    svg.innerHTML = '';
    
    const wrapperRect = wrapper.getBoundingClientRect();
    svg.setAttribute('width', wrapperRect.width);
    svg.setAttribute('height', wrapperRect.height);
    svg.setAttribute('viewBox', `0 0 ${wrapperRect.width} ${wrapperRect.height}`);
    
    let managerOKRs = okrs.filter(okr => !okr.level.toLowerCase().includes('chief'));
    if (managerFilter) {
        managerOKRs = managerOKRs.filter(okr => okr.level === managerFilter);
    }
    
    managerOKRs.forEach(managerOKR => {
        if (!managerOKR.okrLink) return;
        
        const managerCard = document.querySelector(`[data-okr-id="${managerOKR.id}"]`);
        const chiefCard = document.querySelector(`[data-okr-id="${managerOKR.okrLink}"]`);
        
        if (!managerCard || !chiefCard) return;
        
        // Get positions relative to wrapper
        const chiefPos = getRelativePosition(chiefCard, wrapper);
        const managerPos = getRelativePosition(managerCard, wrapper);
        
        // Calculate connection points (center bottom of chief, center top of manager)
        const x1 = chiefPos.x + chiefCard.offsetWidth / 2;
        const y1 = chiefPos.y + chiefCard.offsetHeight;
        const x2 = managerPos.x + managerCard.offsetWidth / 2;
        const y2 = managerPos.y;
        
        // Create path for curved line (smooth bezier curve)
        const midY = y1 + (y2 - y1) * 0.5;
        const controlY1 = y1 + (midY - y1) * 0.5;
        const controlY2 = midY + (y2 - midY) * 0.5;
        const path = `M ${x1} ${y1} C ${x1} ${controlY1}, ${x2} ${controlY2}, ${x2} ${y2}`;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', path);
        line.setAttribute('class', 'connection-line');
        line.setAttribute('data-from', managerOKR.okrLink);
        line.setAttribute('data-to', managerOKR.id);
        svg.appendChild(line);
    });
    
    // Update line highlighting based on current selection
    updateLineHighlighting();
}

// Update connection line highlighting
function updateLineHighlighting() {
    const lines = document.querySelectorAll('.connection-line');
    lines.forEach(line => {
        line.classList.remove('highlighted');
        
        if (selectedOKRId) {
            const fromId = parseInt(line.getAttribute('data-from'));
            const toId = parseInt(line.getAttribute('data-to'));
            
            // Highlight if line connects to/from selected OKR
            if (fromId === selectedOKRId || toId === selectedOKRId) {
                line.classList.add('highlighted');
            }
        }
    });
}

// Selected OKR state
let selectedOKRId = null;
let linkedOKRIds = new Set();
let allOKRs = [];
let currentManagerFilter = '';

// Select an OKR and highlight related ones
function selectOKR(okrId) {
    const okrs = Array.from(document.querySelectorAll('.okr-card'));
    
    // Reset all cards
    okrs.forEach(card => {
        card.classList.remove('selected', 'linked');
    });
    
    selectedOKRId = okrId;
    linkedOKRIds.clear();
    
    // Find the selected OKR
    const selectedCard = document.querySelector(`[data-okr-id="${okrId}"]`);
    if (!selectedCard) return;
    
    // Mark as selected
    selectedCard.classList.add('selected');
    
    // Get the OKR data
    const okrLink = selectedCard.dataset.okrLink;
    const isChief = selectedCard.classList.contains('chief');
    
    if (isChief) {
        // If it's a chief OKR, find all manager OKRs that link to it
        okrs.forEach(card => {
            if (card.dataset.okrLink === okrId.toString()) {
                card.classList.add('linked');
                linkedOKRIds.add(parseInt(card.dataset.okrId));
            }
        });
    } else {
        // If it's a manager OKR, highlight its parent
        if (okrLink) {
            const parentCard = document.querySelector(`[data-okr-id="${okrLink}"]`);
            if (parentCard) {
                parentCard.classList.add('linked');
                linkedOKRIds.add(parseInt(okrLink));
            }
        }
    }
    
    // Update connection line highlighting
    updateLineHighlighting();
}

// Handle window resize to redraw lines
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        drawConnectionLines(allOKRs, currentManagerFilter);
        updateLineHighlighting();
    }, 250);
});

// Initialize the application
async function init() {
    // Ensure DOM is ready
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    
    // Load OKRs from file (or fallback to embedded data)
    allOKRs = await loadOKRs();
    
    if (!allOKRs || allOKRs.length === 0) {
        console.error('No OKRs loaded!');
        return;
    }
    
    const select = document.getElementById('managerSelect');
    const managerLevels = getManagerLevels(allOKRs);
    managerLevels.forEach(level => {
        const opt = document.createElement('option');
        opt.value = level;
        opt.textContent = level;
        select.appendChild(opt);
    });
    
    select.addEventListener('change', () => {
        currentManagerFilter = select.value || '';
        selectedOKRId = null;
        renderOKRs(allOKRs, currentManagerFilter);
    });
    
    renderOKRs(allOKRs, currentManagerFilter);
}

// Start the app when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}
