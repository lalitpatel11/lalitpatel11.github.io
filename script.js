// Get all the progress bars
const progressBars = document.querySelectorAll(".progress-bar");

// Update the width of each progress bar based on the data-progress attribute
progressBars.forEach((progressBar) => {
  const progress = progressBar.dataset.progress;
  progressBar.style.setProperty("--progress-width", progress);
});

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
