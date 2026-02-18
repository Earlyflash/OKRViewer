// OKR data embedded directly (can also be loaded from OKRs.txt file)
// Format: ID | Level | Owner | Objective | Key Result | OKRLink
const OKR_DATA = `ID | Level | Owner     | Objective          | Key Result              | OKRLink
1  | Chief | Chief Tech Bro      | Hire More People   | 10 More people hired    | -
2  | Chief | Chief Tech Bro      | Make more money    | 10 More money made      | -
3  | Manager | DD of Stuff   | Increase Team Size | 3 people hired          | 1
4  | Manager | DD of Stuff   | Improve Margins    | 4 more margin           | 2
5  | Manager | Chief Eng   | More Team Size     | 1 people hired          | 2
6  | Manager | Chief Eng   | Margins Better     | 2 more margin           | 3`;

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
// Format: ID | Level | Owner | Objective | Key Result | OKRLink
function parseOKRs(text) {
    const lines = text.trim().split('\n');
    const okrs = [];
    
    // Skip header line (line 0) and empty lines
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse the pipe-delimited format
        const parts = line.split('|').map(p => p.trim());
        
        if (parts.length >= 6) {
            const id = parts[0];
            const level = parts[1];
            const owner = parts[2];
            const objective = parts[3];
            const keyResult = parts[4];
            const okrLink = parts[5];
            
            const okr = {
                id: parseInt(id),
                level: level,
                owner: owner,
                objective: objective,
                keyResult: keyResult,
                okrLink: okrLink === '-' ? null : parseInt(okrLink)
            };
            
            okrs.push(okr);
        }
    }
    
    return okrs;
}

// Create OKR card element
function createOKRCard(okr, okrs) {
    if (!okr || !okr.level) {
        console.error('Invalid OKR object:', okr);
        return null;
    }
    
    const levelLower = okr.level.toLowerCase();
    const levelClass = levelLower === 'chief' ? 'chief' : levelLower === 'manager' ? 'manager' : 'staff';
    
    const card = document.createElement('div');
    card.className = `okr-card ${levelClass}`;
    card.dataset.okrId = okr.id;
    card.dataset.okrLink = okr.okrLink || '';
    
    const parentOKR = okr.okrLink ? okrs.find(o => o.id === okr.okrLink) : null;
    const linkText = parentOKR ? `🔗 Links to <strong>${parentOKR.objective}</strong>` : '';
    
    card.innerHTML = `
        <div class="okr-level ${levelClass}">${okr.level || 'Unknown'}</div>
        <div class="okr-owner">👤 ${okr.owner || 'Unknown Owner'}</div>
        <div class="okr-objective">${okr.objective || 'No Objective'}</div>
        <div class="okr-key-result">${okr.keyResult || 'No Key Result'}</div>
        ${linkText ? `<div class="okr-link-info">${linkText}</div>` : ''}
    `;
    
    card.addEventListener('click', () => selectOKR(okr.id));
    
    return card;
}

// Get unique manager owners from OKRs
function getManagerOwners(okrs) {
    const managerOKRs = okrs.filter(okr => okr.level && okr.level.toLowerCase() === 'manager');
    return [...new Set(managerOKRs.map(o => o.owner))].sort();
}

// Get unique staff owners from OKRs
function getStaffOwners(okrs) {
    const staffOKRs = okrs.filter(okr => okr.level && okr.level.toLowerCase() === 'staff');
    return [...new Set(staffOKRs.map(o => o.owner))].sort();
}

// Render OKRs, optionally filtered by manager and/or staff owner
function renderOKRs(okrs, managerFilter, staffFilter) {
    const chiefRow = document.getElementById('chiefRow');
    const managerRow = document.getElementById('managerRow');
    const staffRow = document.getElementById('staffRow');
    
    if (!chiefRow || !managerRow || !staffRow) {
        console.error('Could not find required row elements!');
        return;
    }
    
    chiefRow.innerHTML = '';
    managerRow.innerHTML = '';
    staffRow.innerHTML = '';
    
    const chiefOKRs = okrs.filter(okr => okr.level && okr.level.toLowerCase() === 'chief');
    const managerOKRs = okrs.filter(okr => okr.level && okr.level.toLowerCase() === 'manager');
    const staffOKRs = okrs.filter(okr => okr.level && okr.level.toLowerCase() === 'staff');
    
    let chiefsToShow, managersToShow, staffToShow;
    
    if (managerFilter && staffFilter) {
        managersToShow = managerOKRs.filter(okr => okr.owner === managerFilter);
        staffToShow = staffOKRs.filter(okr => okr.owner === staffFilter);
        const chiefIdsFromManagers = new Set(managersToShow.map(o => o.okrLink).filter(Boolean));
        const parentIdsFromStaff = new Set(staffToShow.map(o => o.okrLink).filter(Boolean));
        chiefsToShow = chiefOKRs.filter(okr => chiefIdsFromManagers.has(okr.id) || parentIdsFromStaff.has(okr.id));
    } else if (managerFilter) {
        managersToShow = managerOKRs.filter(okr => okr.owner === managerFilter);
        const linkedChiefIds = new Set(managersToShow.map(o => o.okrLink).filter(Boolean));
        chiefsToShow = chiefOKRs.filter(okr => linkedChiefIds.has(okr.id));
        staffToShow = staffOKRs.filter(s => s.okrLink && (linkedChiefIds.has(s.okrLink) || managersToShow.some(m => m.id === s.okrLink)));
    } else if (staffFilter) {
        staffToShow = staffOKRs.filter(okr => okr.owner === staffFilter);
        const parentIds = new Set(staffToShow.map(o => o.okrLink).filter(Boolean));
        chiefsToShow = chiefOKRs.filter(okr => parentIds.has(okr.id));
        managersToShow = managerOKRs.filter(okr => parentIds.has(okr.id));
    } else {
        chiefsToShow = chiefOKRs;
        managersToShow = managerOKRs;
        staffToShow = staffOKRs;
    }
    
    chiefsToShow.forEach(okr => { const c = createOKRCard(okr, okrs); if (c) chiefRow.appendChild(c); });
    managersToShow.forEach(okr => { const c = createOKRCard(okr, okrs); if (c) managerRow.appendChild(c); });
    staffToShow.forEach(okr => { const c = createOKRCard(okr, okrs); if (c) staffRow.appendChild(c); });
    
    setTimeout(() => {
        drawConnectionLines(okrs, managerFilter, staffFilter);
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

// Draw connection lines: Manager→Chief and Staff→parent (Chief or Manager)
function drawConnectionLines(okrs, managerFilter, staffFilter) {
    const svg = document.getElementById('connectionLines');
    const wrapper = svg.parentElement;
    
    svg.innerHTML = '';
    
    const wrapperRect = wrapper.getBoundingClientRect();
    svg.setAttribute('width', wrapperRect.width);
    svg.setAttribute('height', wrapperRect.height);
    svg.setAttribute('viewBox', `0 0 ${wrapperRect.width} ${wrapperRect.height}`);
    
    function drawLine(fromCard, toCard, fromId, toId) {
        if (!fromCard || !toCard) return;
        const fromPos = getRelativePosition(fromCard, wrapper);
        const toPos = getRelativePosition(toCard, wrapper);
        const x1 = fromPos.x + fromCard.offsetWidth / 2;
        const y1 = fromPos.y + fromCard.offsetHeight;
        const x2 = toPos.x + toCard.offsetWidth / 2;
        const y2 = toPos.y;
        const midY = y1 + (y2 - y1) * 0.5;
        const controlY1 = y1 + (midY - y1) * 0.5;
        const controlY2 = midY + (y2 - midY) * 0.5;
        const path = `M ${x1} ${y1} C ${x1} ${controlY1}, ${x2} ${controlY2}, ${x2} ${y2}`;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', path);
        line.setAttribute('class', 'connection-line');
        line.setAttribute('data-from', fromId);
        line.setAttribute('data-to', toId);
        svg.appendChild(line);
    }
    
    let managerOKRs = okrs.filter(okr => okr.level && okr.level.toLowerCase() === 'manager');
    let staffOKRs = okrs.filter(okr => okr.level && okr.level.toLowerCase() === 'staff');
    if (managerFilter) managerOKRs = managerOKRs.filter(okr => okr.owner === managerFilter);
    if (staffFilter) staffOKRs = staffOKRs.filter(okr => okr.owner === staffFilter);
    
    managerOKRs.forEach(m => {
        if (!m.okrLink) return;
        const managerCard = document.querySelector(`[data-okr-id="${m.id}"]`);
        const chiefCard = document.querySelector(`[data-okr-id="${m.okrLink}"]`);
        drawLine(chiefCard, managerCard, m.okrLink, m.id);
    });
    
    staffOKRs.forEach(s => {
        if (!s.okrLink) return;
        const staffCard = document.querySelector(`[data-okr-id="${s.id}"]`);
        const parentCard = document.querySelector(`[data-okr-id="${s.okrLink}"]`);
        drawLine(parentCard, staffCard, s.okrLink, s.id);
    });
    
    updateLineHighlighting();
}

// Update connection line highlighting and fade lines outside hierarchy
function updateLineHighlighting() {
    const lines = document.querySelectorAll('.connection-line');
    const inHierarchy = selectedOKRId !== null
        ? new Set([selectedOKRId, ...linkedOKRIds])
        : null;
    
    lines.forEach(line => {
        line.classList.remove('highlighted', 'faded');
        
        if (selectedOKRId) {
            const fromId = parseInt(line.getAttribute('data-from'));
            const toId = parseInt(line.getAttribute('data-to'));
            const lineInHierarchy = inHierarchy && (inHierarchy.has(fromId) || inHierarchy.has(toId));
            
            if (lineInHierarchy) {
                if (fromId === selectedOKRId || toId === selectedOKRId) {
                    line.classList.add('highlighted');
                }
            } else {
                line.classList.add('faded');
            }
        }
    });
}

// Selected OKR state
let selectedOKRId = null;
let linkedOKRIds = new Set();
let allOKRs = [];
let currentManagerFilter = '';
let currentStaffFilter = '';

// Select an OKR and highlight related ones (parent and subordinates at each level).
// OKRs outside the hierarchy are faded out. Click the same OKR again to clear selection.
function selectOKR(okrId) {
    const okrs = Array.from(document.querySelectorAll('.okr-card'));
    
    if (selectedOKRId === okrId) {
        okrs.forEach(card => card.classList.remove('selected', 'linked', 'faded'));
        selectedOKRId = null;
        linkedOKRIds.clear();
        updateLineHighlighting();
        return;
    }
    
    okrs.forEach(card => {
        card.classList.remove('selected', 'linked', 'faded');
    });
    
    selectedOKRId = okrId;
    linkedOKRIds.clear();
    
    const selectedCard = document.querySelector(`[data-okr-id="${okrId}"]`);
    if (!selectedCard) return;
    
    selectedCard.classList.add('selected');
    
    const okrLink = selectedCard.dataset.okrLink;
    const selectedOKR = allOKRs.find(o => o.id === okrId);
    if (!selectedOKR) return;
    
    const level = selectedOKR.level.toLowerCase();
    const inHierarchy = new Set([okrId]);
    
    if (level === 'chief') {
        okrs.forEach(card => {
            if (card.dataset.okrLink === okrId.toString()) {
                card.classList.add('linked');
                linkedOKRIds.add(parseInt(card.dataset.okrId));
                inHierarchy.add(parseInt(card.dataset.okrId));
            }
        });
    } else if (level === 'manager') {
        if (okrLink) {
            inHierarchy.add(parseInt(okrLink));
            const parentCard = document.querySelector(`[data-okr-id="${okrLink}"]`);
            if (parentCard) {
                parentCard.classList.add('linked');
                linkedOKRIds.add(parseInt(okrLink));
            }
        }
        okrs.forEach(card => {
            if (card.dataset.okrLink === okrId.toString()) {
                card.classList.add('linked');
                linkedOKRIds.add(parseInt(card.dataset.okrId));
                inHierarchy.add(parseInt(card.dataset.okrId));
            }
        });
    } else if (level === 'staff') {
        if (okrLink) {
            inHierarchy.add(parseInt(okrLink));
            const parentCard = document.querySelector(`[data-okr-id="${okrLink}"]`);
            if (parentCard) {
                parentCard.classList.add('linked');
                linkedOKRIds.add(parseInt(okrLink));
            }
        }
    }
    
    okrs.forEach(card => {
        const id = parseInt(card.dataset.okrId);
        if (!inHierarchy.has(id)) {
            card.classList.add('faded');
        }
    });
    
    updateLineHighlighting();
}

// Handle window resize to redraw lines
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        drawConnectionLines(allOKRs, currentManagerFilter, currentStaffFilter);
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
        console.error('No OKRs loaded! Check the console for parsing errors.');
        const chiefRow = document.getElementById('chiefRow');
        const managerRow = document.getElementById('managerRow');
        const staffRow = document.getElementById('staffRow');
        const msg = '<div style="color: white; text-align: center; padding: 20px;">Error: No OKRs loaded. Check browser console for details.</div>';
        if (chiefRow) chiefRow.innerHTML = msg;
        if (managerRow) managerRow.innerHTML = msg;
        if (staffRow) staffRow.innerHTML = msg;
        return;
    }
    
    const managerSelect = document.getElementById('managerSelect');
    const staffSelect = document.getElementById('staffSelect');
    if (!managerSelect || !staffSelect) {
        console.error('Filter select elements not found!');
        return;
    }
    
    getManagerOwners(allOKRs).forEach(owner => {
        const opt = document.createElement('option');
        opt.value = owner;
        opt.textContent = owner;
        managerSelect.appendChild(opt);
    });
    
    getStaffOwners(allOKRs).forEach(owner => {
        const opt = document.createElement('option');
        opt.value = owner;
        opt.textContent = owner;
        staffSelect.appendChild(opt);
    });
    
    managerSelect.addEventListener('change', () => {
        currentManagerFilter = managerSelect.value || '';
        selectedOKRId = null;
        renderOKRs(allOKRs, currentManagerFilter, currentStaffFilter);
    });
    
    staffSelect.addEventListener('change', () => {
        currentStaffFilter = staffSelect.value || '';
        selectedOKRId = null;
        renderOKRs(allOKRs, currentManagerFilter, currentStaffFilter);
    });
    
    renderOKRs(allOKRs, currentManagerFilter, currentStaffFilter);
}

// Start the app when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}
