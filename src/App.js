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

function App() {

    const [grid, setGrid] = useState(() => {
        const rows = []
        for (let i = 0; i < numRows; i++) {
            rows.push(Array.from(Array(numCols), () => 0));
        }
        return rows;
    });

    console.log(grid);

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
                    style={{
                        width: 20, height: 20,
                        backgroundColor: grid[i][k] ? '#acc864' : undefined,
                        border: "solid 1px black"
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
        setGrid((g) => {
            return produce(g, gridCopy => {
                function fewerThan2MoreThan3(neighbors, i, k) {
                    if (neighbors < 2 || neighbors > 3) {
                        gridCopy[i][k] = 0;
                    }
                }

                function deadWith3Neighbors(i, k, neighbors) {
                    if (g[i][k] === 0 && neighbors === 3) {
                        gridCopy[i][k] = 1;
                    }
                }

                for (let i = 0; i < numRows; i++) {
                    for (let k = 0; k < numCols; k++) {
                        let neighbors = 0;
                        operations.forEach(([x, y]) => {
                            const newI = i + x;
                            const newK = k + y;

                            function withinBounds() {
                                return newI >= 0 && newI < numRows && newK >= 0 && newK < numCols;
                            }

                            function checkOutOfBounds() {
                                if (withinBounds()) {
                                    neighbors += g[newI][newK]
                                }
                            }

                            checkOutOfBounds();
                        })
                        fewerThan2MoreThan3(neighbors, i, k);
                        deadWith3Neighbors(i, k, neighbors);
                    }
                }
            })
        })

        setTimeout(runSimulation, 1000)
    }, [])

    return (
        <>
            <button onClick={() => {
                setRunning(!running);
                if (!running) {
                    runningRef.current = true;
                    runSimulation();
                }
            }}>
                {running ? 'stop' : 'start'}
            </button>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${numCols}, 20px)`
            }}>
                {mapToGrid()}
            </div>
        </>
    );
}

export default App;
