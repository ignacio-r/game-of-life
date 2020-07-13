import React, {useCallback, useRef, useState} from 'react';
import produce from 'immer';
import './App.css';

const numRows = 50;
const numCols = 50;

const operations = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0]
]

const generateEmptyGrid = () => {
    const rows = []
    for (let i = 0; i < numRows; i++) {
        rows.push(Array.from(Array(numCols), () => 0));
    }
    return rows;
}

const generateRandomGrid = () => {
    const rows = []
    for (let i = 0; i < numRows; i++) {
        let random = Math.random() > .7;
        rows.push(Array.from(Array(numCols), () => random ? 1 : 0));
    }
    return rows;
}


function withinBounds(newI, newK) {
    return newI >= 0 && newI < numRows && newK >= 0 && newK < numCols;
}

function checkOutOfBounds(newI, newK, neighbors, grid) {
    if (withinBounds(newI, newK)) {
        neighbors += grid[newI][newK]
    }
    return neighbors;
}

function App() {

    const [grid, setGrid] = useState(() => {
        return generateEmptyGrid();
    });

    function handleCellClick(i, k) {
        return () => {
            const newGrid = produce(grid, gridCopy => {
                gridCopy[i][k] = gridCopy[i][k] ? 0 : 1;
            })
            setGrid(newGrid);
        };
    }

    function showCell(i, k) {
        return <div key={`${i}-${k}`}
                    className={"cell"}
                    style={{
                        backgroundColor: grid[i][k] ? '#acc864' : undefined,
                    }}
                    onClick={handleCellClick(i, k)}>
        </div>;
    }

    function mapToGrid() {
        return grid.map((rows, i) => rows.map((col, k) =>
            showCell(i, k)));
    }

    const [running, setRunning] = useState(false);
    const runningRef = useRef(running);
    runningRef.current = running

    const runSimulation = useCallback(() => {
        if (!runningRef.current) {
            return;
        }
        setGrid((grid) => {
            return produce(grid, gridCopy => {
                function fewerThan2MoreThan3(neighbors, i, k) {
                    if (neighbors < 2 || neighbors > 3) {
                        gridCopy[i][k] = 0;
                    }
                }

                function deadWith3Neighbors(i, k, neighbors) {
                    if (grid[i][k] === 0 && neighbors === 3) {
                        gridCopy[i][k] = 1;
                    }
                }

                for (let i = 0; i < numRows; i++) {
                    for (let k = 0; k < numCols; k++) {
                        let neighbors = 0;
                        operations.forEach(([x, y]) => {
                            const newI = i + x;
                            const newK = k + y;
                            neighbors = checkOutOfBounds(newI, newK, neighbors, grid);
                        })
                        fewerThan2MoreThan3(neighbors, i, k);
                        deadWith3Neighbors(i, k, neighbors);
                    }
                }
            })
        })

        setTimeout(runSimulation, 100)
    }, [])

    function showGrid() {
        return <div className={"grid"} style={{
            gridTemplateColumns: `repeat(${numCols}, 20px)`
        }}>
            {mapToGrid()}
        </div>;
    }

    return (
        <>
            <button onClick={() => {
                setRunning(!running);
                shouldRunSimulation();

                function shouldRunSimulation() {
                    if (!running) {
                        runningRef.current = true;
                        runSimulation();
                    }
                }
            }}>
                {running ? 'stop' : 'start'}
            </button>
            <button onClick={() => setGrid(generateRandomGrid())}>
                random
            </button>
            <button onClick={() => setGrid(generateEmptyGrid())}>
                clear
            </button>
            {showGrid()}
        </>
    );
}

export default App;
