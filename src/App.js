import { useEffect, useState, useRef } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Button,
    DialogTitle
} from '@mui/material';
import Card from './Card';
import "./App.css";

const uniqueElementsArray = [
    {
        type: "lion",
        image: require('./images/lion_616412.png')
    },
    {
        type: "gorilla",
        image: require('./images//gorilla_616543.png')
    },
    {
        type: "panda",
        image: require('./images/panda_616563.png')
    },
    {
        type: "bear",
        image: require('./images/bear_616540.png')
    },
    {
        type: "fox",
        image: require('./images/fox_616519.png')
    },
    {
        type: "deer",
        image: require('./images/deer_616530.png')
    }
]

const shuffleCards = (array) => {
    const length = array.length;
    for (let i = length; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * i);
        const currentIndex = i - 1;
        const temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    return array
}

const App = () => {
    const [cards, setCards] = useState(
        shuffleCards.bind(null, uniqueElementsArray.concat(uniqueElementsArray))   
    );
    const [openCards, setOpenCards] = useState([]);
    const [clearedCards, setClearedCards] = useState({});
    const [allCardsDisabled, setAllCardsDisabled] = useState(false);
    const [movesCount, setMovesCount] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [bestScore, setBestScore] = useState(
        JSON.parse(localStorage.getItem("bestScore")) || Number.POSITIVE_INFINITY
    );
    const timeout = useRef(null);

    const disable = () => {
        setAllCardsDisabled(true);
    }

    const enable = () => {
        setAllCardsDisabled(false);
    }

    const checkGameOver = () => {
        if (Object.keys(clearedCards).length === uniqueElementsArray.length) {
            setModalVisible(true);
            const highScore = Math.min(movesCount, bestScore);
            setBestScore(highScore);
            localStorage.setItem("bestScore", highScore);
        }
    }

    const evaluateMatch = () => {
        const [first, second] = openCards;
        enable();
        if (cards[first].type === cards[second].type) {
            setClearedCards((prev) => ({...prev, [cards[first].type]: true}));
            setOpenCards([]);
            return;
        }
        timeout.current = setTimeout(() => {
            setOpenCards([]);
        }, 500)
    }

    const handleCardClick = (index) => {
        if (openCards.length === 1) {
            setOpenCards((prev) => [...prev, index]);
            setMovesCount(moves => moves + 1);
            disable();
        } else {
            clearTimeout(timeout.current);
            setOpenCards([index]);
        }
    };

    useEffect(() => {
        let timeout = null;
        if (openCards.length === 2) {
            timeout = setTimeout(evaluateMatch, 300);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [openCards]);

    useEffect(() => {
        checkGameOver();
    }, [clearedCards]);

    const checkIsFlipped = (index) => {
        return openCards.includes(index);
    };

    const checkIsInactive = (card) => {
        return Boolean(clearedCards[card.type]);
    };

    const handleRestart = () => {
        setClearedCards({});
        setOpenCards([]);
        setModalVisible(false);
        setMovesCount(0);
        setAllCardsDisabled(false);
        setCards(shuffleCards(uniqueElementsArray.concat(uniqueElementsArray)));
    };

    return (
        <div className="App">
            <header>
                <h3>
                    Memory Card Game
                </h3>
                <div>
                    Select two matching cards to make them vanish!
                </div>
            </header>
            <div className="container">
                {cards.map((card, index) => {
                  return (
                    <Card
                      key={index}
                      card={card}
                      index={index}
                      isDisabled={allCardsDisabled}
                      isInactive={checkIsInactive(card)}
                      isFlipped={checkIsFlipped(index)}
                      // isFlipped={true}
                      onClick={handleCardClick}
                      />
                  )
                })}
            </div>
            <footer>
                <div className="score">
                    <div className="moves">
                        <span className="bold">Moves:</span> {movesCount}
                    </div>
                    {
                        localStorage.getItem("bestScore") && (
                            <div className="high-score">
                                <span className="bold">Best Score:</span> {bestScore}
                            </div>
                        )
                    }
                </div>
                <div className="restart">
                    <Button onClick={handleRestart} color="primary" variant="contained">
                        Restart
                    </Button>
                </div>
            </footer>
            <Dialog
                open={modalVisible}
                disableBackdropClick
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Congration, you done it!
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You completed the game in {movesCount} moves. Your best score is {bestScore} moves.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRestart} color="primary">
                        Restart
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default App;