
window.addEventListener('DOMContentLoaded', () => {
    const pits = Array.from(document.querySelectorAll('.pit'));
    const mancalas = Array.from(document.querySelectorAll('.mancala'))
    const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset');
    const announcer = document.querySelector('.announcer');

    let board = [4,4,4,4,4,4,4,4,4,4,4,4];
    let player1_mancala_score = 0;
    let player2_mancala_score = 0;
    let currentPlayer = 1;
    let isGameActive = true;

    const PLAYER1_WON = 'PlAYER1_WON';
    const PLAYER2_WON = 'PlAYER2_WON';
    const TIE = 'TIE';

    const resetBoard = () => {
        board = [4,4,4,4,4,4,4,4,4,4,4,4];
        player1_mancala_score = 0;
        player2_mancala_score = 0;
        isGameActive = true;
        announcer.classList.add('hide');
        
        if (currentPlayer === 2) {
            changePlayer();
        }

        display_board();

    }

    const isValidAction = (pit) => {
        if (pit.innerText == 0 || pit.classList[2] !== `player${currentPlayer}-valid`) {
            return false;
        }
        return true;
    }

    const updateBoard = (index) => {
        // spread the seeds
        let seeds = board[index];
        board[index] = 0;
        // bottom row, go to the right
        if (index >= 6 && index <= 11) {
            index++;
        }
        // otherwise go to the left
        else {
            index--;
        }
        while (seeds != 0) {
            // if its on the bottom row (i.e index is 6-11)
            if (index >=6 && index <= 11) {
                // go to the right
                board[index]++;
                seeds--;
                index++;
            }
            // if its on the top row (i.e index is 0-5)
            else if (index >= 0 && index <= 5) {
                // go to the left
                board[index]++;
                seeds--;
                index--;
            }
            // on the player1's mancala
            else if (index == 12) {
                if (currentPlayer == 1) {
                    player1_mancala_score++;
                    seeds--;
                    if (seeds == 0) {
                        return true;
                    }
                }
                // continue with the next pit
                index = 5;
            }
            else if (index == -1) {
                if (currentPlayer == 2) {
                    player2_mancala_score++;
                    seeds--;
                    if (seeds == 0) {
                        return true;
                    }
                }
                index = 6;
            }
        }
        // check to see if you can capture
        let player1_inRange = currentPlayer == 1 && index >= 7 && index <= 12;
        let canCaptureSeedsPlayer1 = board[index-1] == 1 && board[index-7] != 0;
        if (player1_inRange && canCaptureSeedsPlayer1) {
            // capture the opponents seeds
            player1_mancala_score += 1 + board[index-7];
            board[index-1] = 0;
            board[index-7] = 0;
        }
        let player2_inRange = currentPlayer == 2 && index >= -1 && index <= 5;
        let canCaptureSeedsPlayer2 = board[index+1] == 1 && board[index+7] != 0;
        if (player2_inRange && canCaptureSeedsPlayer2) {
            // capture the opponents seeds
            player2_mancala_score += 1 + board[index+7];
            board[index+1] = 0;
            board[index+7] = 0;
        }
        return false;
    }

    const changePlayer = () => {
        playerDisplay.classList.remove(`player${currentPlayer}`);
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        playerDisplay.innerText = currentPlayer;
        playerDisplay.classList.add(`player${currentPlayer}`);
    }

    const display_board = () => {
        pits.forEach((pit, index) => {
            pit.innerText = board[index];
        });

        mancalas.forEach(mancala => {
            if (mancala.classList[2] == 'player2-mancala') {
                mancala.innerText = player2_mancala_score;
            }
            else {
                mancala.innerText = player1_mancala_score;
            }
        })
    }

    const announce = (type) => {
        switch(type) {
            case PLAYER1_WON:
                announcer.innerHTML = 'Player <span class="player1">1</span> Won';
                break;
            case PLAYER2_WON:
                announcer.innderHTML = 'Player <span class="player2">2</span> Won';
                break;
            case TIE:
                announcer.innerText = 'Tie';
        }
        announcer.classList.remove('hide');
    }

    const isGameOver = () => {
        let player1_has_no_move = true;
        let player2_has_no_move = true;
        for (let i=0; i < 6; i++) {
            // check if player 1 has a move to play
            if (board[i+6] != 0) {
                player1_has_no_move = false;
            }
            // check if player 2 has a move to play
            if (board[i] != 0) {
                player2_has_no_move = false;
            }
        }
        // returns true if the game is over (i.e one of the players has no moves to play)
        if (player1_has_no_move || player2_has_no_move) {
            // gather the rest of the marbles
            for (let i=0; i < 6; i++) {
                player1_mancala_score += board[i+6];
                board[i+6] = 0;
                player2_mancala_score += board[i];
                board[i] = 0;
            }
            if (player1_mancala_score > player2_mancala_score) {
                announce(PLAYER1_WON);
            }
            else if (player2_mancala_score > player1_mancala_score) {
                announce(PLAYER2_WON);
            }
            else {
                announce(TIE);
            }
            display_board();
            isGameActive = false;
        }
    }

    const userAction = (pit, index) => {
        if (isValidAction(pit) && isGameActive) {
            // spread the seeds
            let goAgain = updateBoard(index);
            display_board();
            isGameOver();
            if (!goAgain) {
                changePlayer();
            }
        }
    }

    pits.forEach((pit, index) => {
        pit.addEventListener('click', () => userAction(pit, index));
    });

    resetButton.addEventListener('click', resetBoard);
})