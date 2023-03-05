const rowCount = 4;
const colCount = 4;

class Tile {
  currentRow = 0;
  currentCol = 0;

  constructor(originalRow, originalCol) {
    this.originalRow = originalRow;
    this.originalCol = originalCol;
  }

  // set currentRow(value) {
  //   this.currentRow = value;
  // }

  // set currentCol(value) {
  //   this.currentCol = value;
  // }
}

window.onload = () => {
  /**
   * @type {HTMLCanvasElement} canvas
   */
  const canvas = document.getElementById('canvas');

  canvas.width = 400;
  canvas.height = 400;

  const tileWidth = canvas.width / colCount;
  const tileHeight = canvas.height / rowCount;

  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.width = canvas.width;
  img.height = canvas.height;

  img.src = "./squirrel.jpg";

  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tiles = [];

    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < colCount; j++) {
        const t = new Tile(i, j);

        if (i == rowCount - 1 && j == colCount - 1) {
          t.originalCol = -1;
          t.originalRow = -1;
        }

        tiles.push(t);
      }
    }

    shuffle(tiles);

    const tiles2d = tiles.reduce((accumulator, t, index) => {
      const r = Math.floor(index / colCount);
      const c = index % colCount;

      if (!Array.isArray(accumulator[r])) {
        accumulator[r] = [];
      }

      accumulator[r][c] = t;

      return accumulator
    }, []);

    let emptyTileRow = 0, emptyTileCol = 0;

    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < colCount; j++) {
        if (tiles2d[i][j].originalCol >= 0 && tiles2d[i][j].originalRow >= 0) {
          ctx.drawImage(img, tileWidth * tiles2d[i][j].originalCol, tileHeight * tiles2d[i][j].originalRow, tileWidth, tileHeight, (tileWidth + 1) * j, (tileHeight + 1) * i, tileWidth, tileHeight);
        } else {
          emptyTileRow = i;
          emptyTileCol = j;
        }
      }
    }

    const canvasLeft = canvas.clientLeft + canvas.offsetLeft;
    const canvasTop = canvas.clientTop + canvas.offsetTop;

    const canvasHandler = (event) => {
      const clickX = event.clientX - canvasLeft;
      const clickY = event.clientY - canvasTop;

      const elementX = clickX % (tileWidth + 1);
      const elementY = clickY % (tileHeight + 1);

      if (elementX < tileWidth && elementY < tileHeight) {

        const clickedColumn = Math.ceil(clickX / (tileWidth + 1)) - 1;
        const clickedRow = Math.ceil(clickY / (tileHeight + 1)) - 1;

        const isClickable = ((clickedRow === emptyTileRow + 1 || clickedRow === emptyTileRow - 1) && clickedColumn === emptyTileCol) ||
          (clickedRow === emptyTileRow && (clickedColumn === emptyTileCol + 1 || clickedColumn === emptyTileCol - 1))

        if (isClickable) {

          const emptyTile = tiles2d[emptyTileRow][emptyTileCol];
          const clickedTile = tiles2d[clickedRow][clickedColumn];

          // clickedTile.currentColumn = emptyTileCol;
          // clickedTile.currentRow = emptyTileRow;

          tiles2d[emptyTileRow][emptyTileCol] = clickedTile;
          tiles2d[clickedRow][clickedColumn] = emptyTile;

          ctx.clearRect((tileWidth + 1) * clickedColumn, (tileHeight + 1) * clickedRow, tileWidth, tileHeight);
          ctx.drawImage(img, tileWidth * clickedTile.originalCol, tileHeight * clickedTile.originalRow, tileWidth, tileHeight, (tileWidth + 1) * emptyTileCol, (tileHeight + 1) * emptyTileRow, tileWidth, tileHeight);

          emptyTileRow = clickedRow;
          emptyTileCol = clickedColumn;

          const victory = tiles2d.every((row, r) => row.every((tile, c) => (tile.originalRow === r || tile.originalRow=== -1) && (tile.originalCol === c || tile.originalCol === -1)))

          if (victory) {
            canvas.removeEventListener('click', canvasHandler);

            const p = new Text('Victory!');
            document.body.appendChild(p);

            /**
             * @type {Button}
             */
            const playAgainButton = document.createElement('button');
            playAgainButton.innerText = 'Play Again';
            document.body.appendChild(playAgainButton);

            playAgainButton.addEventListener('click', () => {
              p.remove();
              playAgainButton.remove();
              img.src = "./squirrel.jpg";
            });
          }
        }
      }
    }

    canvas.addEventListener("click", canvasHandler)
  }
}


function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}