// Last modified: 2/6/23
const COLORS = ["white", "pink", "green", "red", "orange", "grey", "yellow", "blue"]``
const CODE = []
const GUESSES = []

const Rows = document.querySelectorAll(".row")
const Dots = document.querySelectorAll(".dot")
const EndModal = document.getElementById("end-modal")
const EndModalHeader = document.getElementById("end-modal-header")
const EndModalText = document.getElementById("end-modal-text")

const WinSound = new Audio("./audio/Win.wav")
const LoseSound = new Audio("./audio/Lose.mp3")

let currentRow = 0
let end = false

do {
    let color = Math.floor(Math.random() * COLORS.length)
    if (!(color in CODE)) CODE.push(color) // Ensure that there is no duplicate color in code
} while (CODE.length < 4)
Object.freeze(CODE)
setupNextRow()

// Allow dots to change color on click
Dots.forEach(dot => {
    dot.addEventListener("click", () => {
        if (end) return
        if (!dot.classList.contains("clickable")) return
        if (dot.dataset.color == "") {
            dot.dataset.color = COLORS[0]
        } else {
            dot.dataset.color = COLORS[COLORS.indexOf(dot.dataset.color) + 1]
        }
    })
})

// Allow user to submit guess
document.addEventListener("keydown", key => {
    if (end) return
    if (key.key !== "Enter") return

    // Check if dots of active row are filled
    for (const dot of Rows[currentRow].children) {
        if (dot.classList.contains("toggle")) continue
        if (dot.dataset.color == "undefined" || dot.dataset.color == "") {
            alert("Please fill in the dots for the current row.")
            return
        }
    }

    // Following code will only run if key pressed is 'Enter' and all the dots of current row is filled
    const GUESS = []
    for (const dot of Rows[currentRow].children) {
        if (!dot.classList.contains("toggle")) {
            GUESS.push(dot.dataset.color)
        }
    }

    // Check for duplicate color in the guess
    const GUESS_SET = new Set(GUESS)
    if (GUESS_SET.size < 4) {
        alert("Please do not enter duplicate colours in your guess.")
        return
    }

    let same = true
    GUESSES.forEach(guess => {
        for (let i = 0; i < 4; i++) {
            if (guess[i] !== GUESS[i]) {
                same = false
                break
            }
        }
        if (same == true) return
    })
    if (same && currentRow > 0) {
        alert("You already guessed this combination.")
        return
    }

    GUESSES.push(GUESS)

    const CLUE = getClue(GUESS)
    displayClue(CLUE)
    if (CLUE.red === 4) {
        // Win
        endGame("win")
    } else if (currentRow < 12) {
        // Still playing
        currentRow++
        setupNextRow()
    } else {
        // Lose
        endGame("lose")
    }
})

function setupNextRow() {
    if (currentRow === 0) {
        for (const dot of Rows[currentRow].children) {
            dot.classList.add("clickable")
        }
        return
    }
    // Prevent previous row dots from being clicked
    for (const dot of Rows[currentRow - 1].children) {
        dot.classList.remove("clickable")
    }
    // Allow next row of dots to be clickable
    if (currentRow < 12) {
        for (const dot of Rows[currentRow].children) {
            dot.classList.add("clickable")
        }
    } else {
        endGame("lose")
    }
}

function getClue(guess) {
    const CLUE = { white: 0, red: 0 }
    // Red
    for (let i = 0; i < 4; i++) {
        if (guess[i] == CODE[i]) {
            CLUE.red++
        }
    }
    // White
    for (let i = 0; i < 4; i++) {
        if (CODE.includes(guess[i]) && CODE[i] !== guess[i]) {
            CLUE.white++
        }
    }
    return CLUE
}
function displayClue(clue) {
    const Toggles = [
        Rows[currentRow].children[0],
        Rows[currentRow].children[Rows[currentRow].children.length - 1]
    ]
    Toggles[0].dataset.value = clue.white
    if (clue.white > 0) {
        Toggles[0].textContent = clue.white
    }
    Toggles[1].dataset.value = clue.red
    if (clue.red > 0) {
        Toggles[1].textContent = clue.red
    }
}

function endGame(state) {
    end = true
    if (state === "win") {
        EndModalHeader.innerText = "You won!"
        EndModalText.textContent = `You cracked the color code in ${currentRow + 1} guess(es).`
        EndModalHeader.classList.add("win")
        WinSound.play()
    } else {
        EndModalHeader.innerText = "You lost!"
        EndModalText.textContent = `The code is: ${CODE}.`
        EndModalHeader.classList.add("lose")
        LoseSound.play()
    }
    EndModal.showModal()
}