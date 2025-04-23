// Get all the progress bars
const progressBars = document.querySelectorAll(".progress-bar");

// Update the width of each progress bar based on the data-progress attribute
progressBars.forEach((progressBar) => {
  const progress = progressBar.dataset.progress;
  progressBar.style.setProperty("--progress-width", progress);
});

// Sticky Header
const header = document.querySelector('header');
const scrollThreshold = 50;

function handleScroll() {
    if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Add scroll event listener
window.addEventListener('scroll', handleScroll);

const words = [
  "React Native Dev",
  "Node JS Dev",
  "Flutter Dev",
  "UI/UX Designer",
];

const colors = ["blue", "green", "yellow", "red"];
text = document.querySelector(".text");

function* generator() {
  var index = 0;
  while (true) {
    yield index++;

    if (index > 3) {
      index = 0;
    }
  }
}

function printChar(word) {
  let i = 0;
  text.innerHTML = "";
  text.classList.add(colors[words.indexOf(word)]);
  let id = setInterval(() => {
    if (i >= word.length) {
      deleteChar();
      clearInterval(id);
    } else {
      text.innerHTML += word[i];
      i++;
    }
  }, 500);
}
function deleteChar() {
  let word = text.innerHTML;
  let i = word.length - 1;
  let id = setInterval(() => {
    if (i >= 0) {
      text.innerHTML = text.innerHTML.substring(0, text.innerHTML.length - 1);
      i--;
    } else {
      text.classList.remove(colors[words.indexOf(word)]);
      printChar(words[gen.next().value]);
      clearInterval(id);
    }
  }, 300);
}
let gen = generator();
printChar(words[gen.next().value]);

// Theme switcher functionality
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeOptions = document.querySelector('.theme-options');
    const themeButtons = document.querySelectorAll('.theme-option');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Toggle theme options
    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        themeOptions.classList.toggle('show');
    });

    // Close theme options when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeOptions.contains(e.target) && !themeToggle.contains(e.target)) {
            themeOptions.classList.remove('show');
        }
    });

    // Theme selection
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            themeOptions.classList.remove('show');

            // Add animation effect
            document.body.style.transition = 'background-image 0.5s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 500);
        });
    });
});

// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.fa-bars');
    const nav = document.querySelector('nav');
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);

    menuButton.addEventListener('click', function() {
        nav.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });

    menuOverlay.addEventListener('click', function() {
        nav.classList.remove('active');
        menuOverlay.classList.remove('active');
    });

    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Close mobile menu if open
            nav.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
    });

    // Sticky Header
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Update active navigation link based on scroll position
        const sections = document.querySelectorAll('main[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
});
