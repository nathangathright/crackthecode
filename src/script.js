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

let combinations = [];
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    for (let k = 0; k < 10; k++) {
      for (let l = 0; l < 10; l++) {
        combinations.push(`${i}${j}${k}${l}`);
      }
    }
  }
}

let messages = [
  "Can you crack the code? After each 4-digit guess, I’ll tell you how many digits are in the correct position.",
  "As you enter each digit, the numeric keyboard will update to show only the digits that are still possible.",
  "Good luck!",
];

const urlParams = new URLSearchParams(window.location.search);
const game = urlParams.get("game");
const secretCode = game ? atob(game) : Math.floor(1000 + Math.random() * 9000);
if (!game) {
  window.location
    .assign(
      `${window.location.origin}?game=${btoa(secretCode).replace(/=+$/, "")}`,
    )
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
  bubble.innerHTML = message;
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
};

messages.forEach((message) => {
  appendMessage(message, false);
});

const updateCombinations = (guess) => {
  // remove this guess from the list of combinations
  combinations = combinations.filter((combo) => {
    return combo !== guess;
  });

  let [a, b, c, d] = guess.split("").map((digit) => parseInt(digit));
  switch (numCorrectDigits(guess)) {
    case 3:
      // only keep combinations that have exactly 3 of the digits from this guess in the same positions
      combinations = combinations.filter((combo) => {
        let [w, x, y, z] = combo.split("").map((digit) => parseInt(digit));
        return (
          (a === w && b === x && c === y && d !== z) ||
          (a === w && b === x && c !== y && d === z) ||
          (a === w && c === y && b !== x && d === z) ||
          (b === x && c === y && a !== w && d === z)
        );
      });
      break;
    case 2:
      // only keep combinations that have exactly 2 of the digits from this guess in the same positions
      combinations = combinations.filter((combo) => {
        let [w, x, y, z] = combo.split("").map((digit) => parseInt(digit));
        return (
          (a === w && b === x && c !== y && d !== z) ||
          (a === w && b !== x && c === y && d !== z) ||
          (a === w && b !== x && c !== y && d === z) ||
          (a !== w && b === x && c === y && d !== z) ||
          (a !== w && b === x && c !== y && d === z) ||
          (a !== w && b !== x && c === y && d === z)
        );
      });
      break;
    case 1:
      // only keep combinations that have exactly 1 of the digits from this guess in the same positions
      combinations = combinations.filter((combo) => {
        let [w, x, y, z] = combo.split("").map((digit) => parseInt(digit));
        return (
          (a === w && b !== x && c !== y && d !== z) ||
          (a !== w && b === x && c !== y && d !== z) ||
          (a !== w && b !== x && c === y && d !== z) ||
          (a !== w && b !== x && c !== y && d === z)
        );
      });
      break;
    case 0:
      // only keey combinations that have none of the digits from this guess in the same positions
      combinations = combinations.filter((combo) => {
        let [w, x, y, z] = combo.split("").map((digit) => parseInt(digit));
        return a !== w && b !== x && c !== y && d !== z;
      });
      break;
  }
};

const updateAcceptableDigits = (partialguess) => {
  acceptableDigits = {
    0: [],
    1: [],
    2: [],
    3: [],
  };

  combinations
    .filter((combo) => combo.startsWith(partialguess))
    .forEach((combo) => {
      combo.split("").forEach((digit, index) => {
        if (!acceptableDigits[index].includes(parseInt(digit))) {
          acceptableDigits[index].push(parseInt(digit));
        }
      });
    });
};

const updateKeyboard = () => {
  const inputLength = code.value.length || 0;
  keyboardButtons.forEach((button) => {
    button.disabled = false;
    submitButton.disabled = true;
    if (inputLength === 4) {
      button.disabled = true;
      submitButton.disabled = false;
      return;
    }
    updateAcceptableDigits(code.value);
    if (!acceptableDigits[inputLength].includes(parseInt(button.value))) {
      button.disabled = true;
    }
  });
};

const generateEmoji = () => {
  let emoji = "";
  guesses.forEach((guess) => {
    emoji += "<br>";
    guess.split("").forEach((digit, index) => {
      if (digit === secretCode[index]) {
        emoji += "🔑";
      } else {
        emoji += "🔒";
      }
    });
  });
  return emoji;
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
    if (document.querySelector(`#key${event.key}`).disabled) return;
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
  updateCombinations(guess);
  code.value = "";

  const correctDigits = numCorrectDigits(guess);
  if (correctDigits === 4) {
    isVictorious = true;
    let pluralCount =
      guesses.length === 1
        ? `${guesses.length} guess`
        : `${guesses.length} guesses`;
    appendMessage(
      `You cracked the code in ${pluralCount}!${generateEmoji()}`,
      false,
    );
    appendMessage(
      "Tap the 🔄 button to play again. Tap the 🔀 button to create your own puzzle.",
      false,
    );
  } else {
    let count = combinations.length;
    let digits = correctDigits === 1 ? "digit" : "digits";
    let combos = count === 1 ? "combo" : "combos";
    appendMessage(
      `${correctDigits} correct ${digits}! ${count} ${combos} remaining.`,
      false,
    );
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
