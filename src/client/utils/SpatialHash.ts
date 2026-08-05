/**
 * Spatial hash grid for O(1) broad-phase collision queries.
 * Replaces O(n²) pairwise checks with grid-cell lookups.
 */
export class SpatialHash<T extends { x: number; y: number }> {
  private cellSize: number;
  private grid: Map<string, T[]>;

  constructor(cellSize: number = 64) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  clear(): void {
    this.grid.clear();
  }

  insert(item: T): void {
    const [cellX, cellY] = this.getCellCoords(item.x, item.y);
    const key = this.getKey(cellX, cellY);
    const bucket = this.grid.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      this.grid.set(key, [item]);
    }
  }

  /**
   * Returns all items in the same cell and adjacent cells as the query point,
   * within the given radius.
   */
  query(x: number, y: number, radius: number): T[] {
    const results: T[] = [];
    const minCellX = Math.floor((x - radius) / this.cellSize);
    const maxCellX = Math.floor((x + radius) / this.cellSize);
    const minCellY = Math.floor((y - radius) / this.cellSize);
    const maxCellY = Math.floor((y + radius) / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = this.getKey(cx, cy);
        const bucket = this.grid.get(key);
        if (bucket) {
          for (let i = 0; i < bucket.length; i++) {
            results.push(bucket[i]!);
          }
        }
      }
    }

    return results;
  }

  /** Bulk insert array of items */
  insertAll(items: T[]): void {
    for (let i = 0; i < items.length; i++) {
      this.insert(items[i]!);
    }
  }

  private getKey(cellX: number, cellY: number): string {
    return `${cellX},${cellY}`;
  }

  private getCellCoords(x: number, y: number): [number, number] {
    return [Math.floor(x / this.cellSize), Math.floor(y / this.cellSize)];
  }
}
