/**
 * Interactive Animations Module: Git Graph Canvas and 3D Card Hover Parallax
 */

let canvas, ctx;
let particles = [];
let animationId;
let isImploding = false;
let targetX = 0;
let targetY = 0;
let implodeCallback = null;

class CommitNode {
    constructor(w, h) {
        this.reset(w, h);
        // Randomize initial positions fully
        this.x = Math.random() * w;
        this.y = Math.random() * h;
    }

    reset(w, h) {
        this.x = Math.random() * w;
        this.y = h + Math.random() * 50; // Start off-screen bottom
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -(Math.random() * 0.5 + 0.3); // Float up
        this.radius = Math.random() * 4 + 3;
        this.baseAlpha = Math.random() * 0.4 + 0.3;
        this.alpha = this.baseAlpha;
        this.pulseAngle = Math.random() * Math.PI;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.color = Math.random() > 0.4 ? '#2563eb' : '#f43f5e'; // Blue or Rose branches
    }

    update(w, h) {
        if (isImploding) {
            // Rapidly accelerate towards the search input target coordinates
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                // Node reached the search bar target, make it fade
                this.alpha -= 0.08;
            } else {
                const speed = 18;
                this.x += (dx / distance) * speed;
                this.y += (dy / distance) * speed;
            }
            return;
        }

        this.x += this.vx;
        this.y += this.vy;
        
        // Pulse alpha
        this.pulseAngle += this.pulseSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.pulseAngle) * 0.15;

        // Reset if float off top or sides
        if (this.y < -10 || this.x < -10 || this.x > w + 10) {
            this.reset(w, h);
        }
    }

    draw() {
        if (this.alpha <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
        ctx.globalAlpha = 1;
    }
}

/**
 * Initializes the Git Graph canvas animation
 */
export function initGitGraph() {
    canvas = document.getElementById('git-graph-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.removeEventListener('resize', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);

    // Create initial commit nodes
    const nodeCount = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 55);
    particles = [];
    for (let i = 0; i < nodeCount; i++) {
        particles.push(new CommitNode(canvas.width, canvas.height));
    }

    animate();
}

/**
 * Resets the landing page animations (canvas state and card flip state)
 */
export function resetLandingAnimations() {
    isImploding = false;
    implodeCallback = null;
    
    const card = document.querySelector('.mock-profile-card');
    if (card) {
        card.classList.remove('reveal-flip');
        // Re-trigger the 3D flip reveal after 1.5 seconds
        setTimeout(() => {
            card.classList.add('reveal-flip');
        }, 1500);
    }
    
    initGitGraph();
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function animate() {
    if (!canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Draw branch lines (connections)
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Connect close nodes with branch-like lines
            if (dist < 120 && p1.alpha > 0 && p2.alpha > 0) {
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                // Create a slight curve (branch feeling)
                ctx.quadraticCurveTo(midX + (p1.vy * 5), midY, p2.x, p2.y);
                
                const alpha = (1 - dist / 120) * 0.15;
                ctx.strokeStyle = '#2563eb';
                ctx.globalAlpha = alpha;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }

    // Update and draw commit nodes
    let visibleNodes = 0;
    particles.forEach(p => {
        p.update(w, h);
        if (p.alpha > 0) {
            p.draw();
            visibleNodes++;
        }
    });

    if (isImploding && visibleNodes === 0) {
        cancelAnimationFrame(animationId);
        if (implodeCallback) {
            implodeCallback();
            implodeCallback = null;
        }
        return;
    }

    animationId = requestAnimationFrame(animate);
}

/**
 * Triggers the implosion effect towards the search bar
 * @param {HTMLElement} targetElement 
 * @param {Function} callback 
 */
export function implodeNodes(targetElement, callback) {
    if (!targetElement) {
        callback();
        return;
    }

    const rect = targetElement.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    // Find screen coordinates relative to canvas
    targetX = rect.left + rect.width / 2 - canvasRect.left;
    targetY = rect.top + rect.height / 2 - canvasRect.top;
    
    isImploding = true;
    implodeCallback = callback;
}

/**
 * Initializes the 3D Profile Card Parallax tilt
 */
export function initCardTilt() {
    const card = document.querySelector('.mock-profile-card');
    if (!card) return;

    // Trigger 3D reveal flip after a short delay (shimmer skeleton -> real profile)
    setTimeout(() => {
        card.classList.add('reveal-flip');
    }, 1500);

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Normalize coordinates from -0.5 to 0.5
        const px = (x / rect.width) - 0.5;
        const py = (y / rect.height) - 0.5;
        
        // Tilt rotations
        const tiltX = -py * 25; // max tilt degrees X
        const tiltY = px * 25;  // max tilt degrees Y
        
        // If card is flipped (reveal-flip), we rotate relative to 180 degrees
        const baseRotationY = card.classList.contains('reveal-flip') ? 180 : 0;
        const finalTiltY = baseRotationY + (baseRotationY === 180 ? -tiltY : tiltY);
        
        card.style.transform = `rotateX(${tiltX}deg) rotateY(${finalTiltY}deg) translateY(-8px)`;
        
        // Set glow gradients center variables (invert X glow position if flipped)
        const pctX = baseRotationY === 180 ? (1 - (x / rect.width)) * 100 : (x / rect.width) * 100;
        const pctY = (y / rect.height) * 100;
        card.style.setProperty('--glow-x', `${pctX}%`);
        card.style.setProperty('--glow-y', `${pctY}%`);
    });

    card.addEventListener('mouseleave', () => {
        // Reset tilt position softly
        const baseRotationY = card.classList.contains('reveal-flip') ? 180 : 0;
        card.style.transform = `rotateX(0deg) rotateY(${baseRotationY}deg) translateY(0px)`;
        card.style.setProperty('--glow-x', '50%');
        card.style.setProperty('--glow-y', '50%');
    });
}

/**
 * Initializes the 3D Parallax tilt on Dashboard profile and chart containers
 */
export function initDashboardTilt() {
    const targets = document.querySelectorAll('.profile-card-hyper, .chart-card-hyper');
    targets.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Normalize coordinates from -0.5 to 0.5
            const px = (x / rect.width) - 0.5;
            const py = (y / rect.height) - 0.5;
            
            // Subtle rotation tilt
            const tiltX = -py * 12;
            const tiltY = px * 12;
            
            card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
            card.style.boxShadow = 'var(--shadow-md)';
            card.style.borderColor = 'var(--primary)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)';
            card.style.boxShadow = 'var(--shadow-sm)';
            card.style.borderColor = 'var(--border)';
        });
    });
}

// --- Dashboard Canvas Constellation ---
let appCanvas, appCtx;
let appParticles = [];
let appAnimationId;

export function initAppGitGraph() {
    appCanvas = document.getElementById('app-git-graph-canvas');
    if (!appCanvas) return;
    appCtx = appCanvas.getContext('2d');

    resizeAppCanvas();
    window.removeEventListener('resize', resizeAppCanvas);
    window.addEventListener('resize', resizeAppCanvas);

    // Populate dashboard nodes
    const nodeCount = Math.min(Math.floor((appCanvas.width * appCanvas.height) / 20000), 45);
    appParticles = [];
    for (let i = 0; i < nodeCount; i++) {
        appParticles.push(new CommitNode(appCanvas.width, appCanvas.height));
    }

    if (appAnimationId) {
        cancelAnimationFrame(appAnimationId);
    }
    appAnimate();
}

function resizeAppCanvas() {
    if (!appCanvas) return;
    appCanvas.width = appCanvas.offsetWidth;
    appCanvas.height = appCanvas.offsetHeight;
}

function appAnimate() {
    if (!appCanvas) return;
    appCtx.clearRect(0, 0, appCanvas.width, appCanvas.height);

    const w = appCanvas.width;
    const h = appCanvas.height;

    // Draw branch lines (connections)
    appCtx.lineWidth = 1;
    for (let i = 0; i < appParticles.length; i++) {
        for (let j = i + 1; j < appParticles.length; j++) {
            const p1 = appParticles[i];
            const p2 = appParticles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 130 && p1.alpha > 0 && p2.alpha > 0) {
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;
                
                appCtx.beginPath();
                appCtx.moveTo(p1.x, p1.y);
                appCtx.quadraticCurveTo(midX + (p1.vy * 5), midY, p2.x, p2.y);
                
                const alpha = (1 - dist / 130) * 0.12;
                appCtx.strokeStyle = '#2563eb';
                appCtx.globalAlpha = alpha;
                appCtx.stroke();
                appCtx.globalAlpha = 1;
            }
        }
    }

    // Update and draw commit nodes
    appParticles.forEach(p => {
        p.update(w, h);
        if (p.alpha > 0) {
            appCtx.beginPath();
            appCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            appCtx.fillStyle = p.color;
            appCtx.globalAlpha = p.alpha;
            appCtx.shadowBlur = 8;
            appCtx.shadowColor = p.color;
            appCtx.fill();
            appCtx.shadowBlur = 0;
            appCtx.globalAlpha = 1;
        }
    });

    appAnimationId = requestAnimationFrame(appAnimate);
}
