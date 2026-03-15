document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch and render projects from API
    fetchProjects();

    // 2. Typing Effect for Hero Section
    initTypingEffect();

    // 3. Scroll Spy for active Navigation Menu
    initScrollSpy();
});

async function fetchProjects() {
    const grid = document.getElementById('projects-grid');
    
    try {
        const response = await fetch('/api/projects/');
        const projects = await response.json();
        
        grid.innerHTML = ''; // Clear loader
        
        if(projects.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted); padding: 1rem;">No projects to display yet.</p>';
            return;
        }

        projects.forEach(project => {
            const dateStr = new Date(project.created_at).toLocaleDateString();
            const techList = project.technologies.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('');
            
            // Build card based on new futuristic design
            const cardHtml = `
                <div class="project-card">
                    <div class="card-img-wrapper">
                        <img src="${project.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80'}" alt="${project.title}">
                    </div>
                    <div class="card-content">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="tech-tags">
                            ${techList}
                        </div>
                    </div>
                    <div class="card-footer">
                        <span class="date">${dateStr}</span>
                        ${project.url ? `<a href="${project.url}" target="_blank">View Live <i class='bx bx-link-external'></i></a>` : '<span></span>'}
                    </div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHtml);
        });

    } catch (error) {
        console.error("Error fetching projects:", error);
        grid.innerHTML = '<p style="color:var(--danger); padding: 1rem;">Failed to load portfolio items. Please try again later.</p>';
    }
}

function initTypingEffect() {
    const roles = ["UI/UX Designer", "Frontend Developer", "Problem Solver"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const spanElement = document.querySelector('.typing-text');
    
    if(!spanElement) return;

    function typeText() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            spanElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            spanElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 150;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            typingSpeed = 2000; // Pause at end 
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // Pause before new word
        }

        setTimeout(typeText, typingSpeed);
    }

    // Start typing effect
    setTimeout(typeText, 1000);
}

function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.floating-nav ul li a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    });

    // Smooth scroll behavior is handled natively in modern browsers via CSS (scroll-behavior: smooth) 
    // but we can ensure it here.
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}
