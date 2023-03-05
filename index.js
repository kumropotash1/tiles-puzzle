const size = 4;

class Tile {
  render = true;

  constructor(originalRow, originalCol) {
    this.originalRow = originalRow;
    this.originalCol = originalCol;
  }
}

window.onload = () => {
  /**
   * @type {HTMLCanvasElement} canvas
   */
  const canvas = document.getElementById('canvas');

  canvas.width = 400;
  canvas.height = 400;

  const tileWidth = canvas.width / size;
  const tileHeight = canvas.height / size;

  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.width = canvas.width;
  img.height = canvas.height;

  img.src = "./squirrel.jpg";

  const newGame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /**
     * @type {Tile[]} tiles
     */
    const tiles = [];

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const t = new Tile(i, j);

        if (i == size - 1 && j == size - 1) {
          t.render = false;
        }

        tiles.push(t);
      }
    }

    let solvable = false;

    // Solvability of an n X n puzzle:
    // https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/
    while (!solvable) {
      shuffle(tiles);

      const t = [];

      let emptyTileRow = 0;
      tiles.forEach(tile => {
        if (tile.render) t.push(tile.originalRow * size + tile.originalCol);
        else emptyTileRow = tile.originalRow;
      })

      const inversions = inversionCount(t);

      solvable = ((size % 2 === 1) && (inversions % 2 === 0)) || 
      ((size % 2 === 0) && (inversions % 2 === size - emptyTileRow));

      // console.log("Tiles: ", tiles, "Solvable: ", solvable);
    }

    const tiles2d = tiles.reduce((accumulator, t, index) => {
      const r = Math.floor(index / size);
      const c = index % size;

      if (!Array.isArray(accumulator[r])) {
        accumulator[r] = [];
      }

      accumulator[r][c] = t;

      return accumulator
    }, []);

    let emptyTileRow = 0, emptyTileCol = 0;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (tiles2d[i][j].originalCol >= 0 && tiles2d[i][j].originalRow >= 0 && tiles2d[i][j].render) {
          ctx.drawImage(img, tileWidth * tiles2d[i][j].originalCol, tileHeight * tiles2d[i][j].originalRow, tileWidth, tileHeight, (tileWidth + 1) * j, (tileHeight + 1) * i, tileWidth, tileHeight);
        } else {
          emptyTileRow = i;
          emptyTileCol = j;
        }
      }
    }

    const canvasLeft = canvas.clientLeft + canvas.offsetLeft;
    const canvasTop = canvas.clientTop + canvas.offsetTop;

    const canvasClickHandler = (event) => {
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

          const victory = tiles2d.every((row, r) => row.every((tile, c) => tile.originalRow === r && tile.originalCol === c))

          if (victory) {
            canvas.removeEventListener('click', canvasClickHandler);

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

    canvas.addEventListener("click", canvasClickHandler)
  }

  img.onload = newGame;
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

/**
 * 
 * @param {number[]} arr 
 */
function inversionCount(arr) {
  if (!Array.isArray(arr) || !arr.length) return 0;

  function mergeSort(arr, left, right) {
    let count = 0;

    if (left < right) {
      const mid = Math.floor((left + right) / 2);

      count += mergeSort(arr, left, mid);
      count += mergeSort(arr, mid + 1, right);
      count += mergeAndCount(arr, left, mid, right);
    }

    return count;
  }

  /**
   * 
   * @param {number[]} arr
   * @param {number} left
   * @param {number} mid
   * @param {number} right 
   */
  function mergeAndCount(arr, left, mid, right) {
    const leftArr = [], rightArr = [];

    for (let i = left; i <= mid; i++) {
      leftArr.push(arr[i]);
    }

    for (let i = mid + 1; i <= right; i++) {
      rightArr.push(arr[i]);
    }

    let i = 0, j = 0, k = left, inversions = 0;

    while (i < leftArr.length && j < rightArr.length) {
      if (leftArr[i] <= rightArr[j]) {
        arr[k++] = leftArr[i++];
      } else {
        arr[k++] = rightArr[j++];
        inversions += (mid + 1) - (left + i);
      }
    }

    while (i < leftArr.length) {
      arr[k++] = leftArr[i++];
    }
    while (j < rightArr.length) {
      arr[k++] = rightArr[j++];
    }

    return inversions
  }

  return mergeSort(arr, 0, arr.length - 1);
}