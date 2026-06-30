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
