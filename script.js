// Setup
const COLORS = Object.freeze(["white", "pink", "green", "red", "orange", "grey", "yellow", "blue"])
const CODE = ["red", "pink", "blue", "white"]
const GUESSES = []

const Rows = document.querySelectorAll(".row")
const Dots = document.querySelectorAll(".dot")
const ErrorModal = document.getElementById("error-modal")
const EndModal = document.getElementById("end-modal")
const EndModalHeader = document.getElementById("end-modal-header")
const EndModalText = document.getElementById("end-modal-text")

const WinSound = new Audio("./audio/Win.wav")
const LoseSound = new Audio("./audio/Lose.mp3")

let currentRow = 0
let end = false

// for (let i = 0; i < 4; i++) {
//     CODE.push(COLORS[Math.floor(Math.random() * COLORS.length)])
// }
Object.freeze(CODE)
ErrorModal.children[0].addEventListener("click", () => ErrorModal.close())
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
    // Check if child dots of active row is filled
    for (const dot of Rows[currentRow].children) {
        if (dot.classList.contains("toggle")) continue
        if (dot.dataset.color == "undefined" || dot.dataset.color == "") {
            ErrorModal.show()
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

    let same = true
    GUESSES.forEach(guess => {
        for (let i = 0; i < 4; i++) {
            if (guess[i] !== GUESS[i]) {
                same = false
                break
            }
        }
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

// Functions
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
    const CLUE_STATE = {}

    guess.forEach(color => {
        CLUE_STATE[color] = false
    })

    for (let i = 0; i < 4; i++) {
        if (guess[i] == CODE[i] && CLUE_STATE[guess[i]] === false) {
            CLUE.red++
            CLUE_STATE[guess[i]] = true
        }
    }
    for (let i = 0; i < 4; i++) {
        if (CODE.includes(guess[i]) && CODE[i] !== guess[i] && CLUE_STATE[guess[i]] === false) {
            CLUE.white++
            CLUE_STATE[guess[i]] = true
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