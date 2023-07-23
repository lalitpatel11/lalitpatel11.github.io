// Get all the progress bars
const progressBars = document.querySelectorAll(".progress-bar");

// Update the width of each progress bar based on the data-progress attribute
progressBars.forEach((progressBar) => {
  const progress = progressBar.dataset.progress;
  progressBar.style.setProperty("--progress-width", progress);
});
