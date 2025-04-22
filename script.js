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
