const code = document.querySelector("#code");
const submitButton = document.querySelector("#submit");
const keyboardButtons = document.querySelectorAll("[name=keyboard]");
const replayButton = document.querySelector("#replay");
const remixButton = document.querySelector("#remix");
const section = document.querySelector("section");
const main = document.querySelector("main");
const backspaceButton = document.querySelector("#backspace");
let isVictorious = false;
let guesses = [];
let acceptableDigits = {
  0: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  2: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  3: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
};

let messages = [
  "Can you crack the code? After each 4-digit guess, I’ll tell you how many digits are in the correct position.",
  "As you enter each digit, the numeric keyboard will update to show you which digits are still available.",
  "The logic to update the keyboard is still a work in progress. Good luck!",
];

const urlParams = new URLSearchParams(window.location.search);
const game = urlParams.get("game");
const secretCode = game ? atob(game) : Math.floor(1000 + Math.random() * 9000);
if (!game) {
  window.location
    .assign(`${window.location.origin}?game=${btoa(secretCode).replace(/=+$/, "")}`)
    .catch((err) => console.error("An error occurred", err));
}

const numCorrectDigits = (guess) => {
  return guess.split("").filter((digit, index) => {
    return digit === secretCode[index];
  }).length;
};

const hasFourDigits = () => code.value.length === 4;

const appendMessage = (message, isUser) => {
  const bubble = document.createElement("li");
  bubble.textContent = message;
  bubble.classList.add(
    "relative",
    "max-w-[85%]",
    "list-none",
    "rounded-3xl",
    "px-4",
    "py-2",
  );
  if (isUser) {
    bubble.classList.add(
      "bg-blue-500",
      "text-white",
      "dark:text-white",
      "self-end",
      "rounded-br-1",
    );
  } else {
    bubble.classList.add(
      "bg-slate-200",
      "dark:bg-slate-800",
      "text-black",
      "dark:text-white",
      "text-slate-900",
      "self-start",
      "rounded-bl-1",
    );
  }
  main.appendChild(bubble);
  section.scrollTop = section.scrollHeight;
}

messages.forEach((message) => {
  appendMessage(message, false);
})

const updateAcceptableDigits = () => {
  guesses.forEach((guess) => {
    switch (numCorrectDigits(guess)) {
      case 0:
        guess.split("").forEach((digit, index) => {
          acceptableDigits[index] = acceptableDigits[index].filter(
            (acceptableDigit) => acceptableDigit !== parseInt(digit),
          );
        });
        break;
      case 1:
        // determine which digits the user should be able to use
        break;
      // Add more cases as needed
    }
  });
}

const updateKeyboard = () => {
  updateAcceptableDigits();
  const inputLength = code.value.length || 0;
  keyboardButtons.forEach((button) => {
    button.disabled = false;
    submitButton.disabled = true;
    if (isVictorious) button.disabled = true;
    if (inputLength === 4) {
      button.disabled = true;
      submitButton.disabled = false;
      return;
    }
    if (inputLength === 3) {
      const guess = code.value + button.value;
      if (guessesArray.includes(guess)) {
        button.disabled = true;
      }
    }
    if (!acceptableDigits[inputLength].includes(parseInt(button.value))) {
      button.disabled = true;
    }
  });
};

keyboardButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (hasFourDigits()) return;
    code.value += button.value;
    updateKeyboard();
  });
});

document.addEventListener("keydown", (event) => {
  if (isVictorious) return;

  if (event.key >= 0 && event.key <= 9) {
    if (hasFourDigits()) return;
    code.value += event.key;
    updateKeyboard();
  }

  if (event.key === "Backspace") {
    backspaceButton.click();
  }

  if (event.key === "Enter") {
    submitButton.click();
  }
});

backspaceButton.addEventListener("click", () => {
  code.value = code.value.slice(0, -1);
  updateKeyboard();
});

submitButton.addEventListener("click", () => {
  if (!hasFourDigits()) return;
  const guess = code.value;
  guesses.push(guess);
  appendMessage(guess, true);
  code.value = "";

  const correctDigits = numCorrectDigits(guess);
  if (correctDigits === 4) {
    isVictorious = true;
    let pluralCount = guesses.length === 1 ? `${guesses.length} guess` : `${guesses.length} guesses`;
    appendMessage(`Congratulations! You’ve cracked the code! 🎉 It took you ${pluralCount}.`,false);
    appendMessage("Tap the 🔄 button to play again. Tap the 🔀 button to create your own puzzle.", false);
  } else {
    let plural = correctDigits === 1 ? "" : "s";
    appendMessage(`${correctDigits} correct digit${plural}`, false);
    updateKeyboard();
  }
});

replayButton.addEventListener("click", () => {
  window.location
    .assign(window.location.origin + window.location.pathname)
    .catch((err) => console.error("An error occurred", err));
});

remixButton.addEventListener("click", () => {
  const code = window.prompt("Enter your secret code");
  if (code) {
    window.location
      .assign(`${window.location.origin}?game=${btoa(code).replace(/=+$/, "")}`)
      .catch((err) => console.error("An error occurred", err));
  }
});
