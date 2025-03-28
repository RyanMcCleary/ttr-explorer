import {Heap} from 'heap-js';
import {Route, destinations} from './Routes';

export class Graph {
  private adjacencies: Map<number, number>[];
  public readonly size: number;
  public readonly vertexNames: Map<string, string>;
  public readonly indexMap: Map<string, number>;
  public readonly revIndexMap: Map<number, string>;

  constructor(vertexNames: Map<string, string>) {
    this.vertexNames = vertexNames;
    this.size = vertexNames.size;
    this.adjacencies = Array.from({length: this.size}, () => new Map());
    this.indexMap = new Map([...vertexNames.keys()].map((key, i) => [key, i]));
    this.revIndexMap = new Map([...vertexNames.keys()].map((key, i) => [i, key]));
  }

  public addRoutes(routes: Route[]): void {
    for (const route of routes) {
      this.addEdgeByKey(route.start, route.end, route.segments);
    }
  }

  private inBounds(start: number, end: number): boolean {
    return start < this.size && start >= 0 && end < this.size && end >= 0;
  }

  public addEdgeByKey(start: string, end: string, weight: number): void {
    if (!this.indexMap.has(start) || !this.indexMap.has(end)) {
      throw new Error('Invalid vertex key');
    }
    this.addEdge(this.indexMap.get(start)!, this.indexMap.get(end)!, weight);
  }

  public addEdge(start: number, end: number, weight: number): void {
    if (!this.inBounds(start, end)) {
      throw new Error(`The indices of nodes must be >= 0 and < ${this.size}`);
    }
    this.adjacencies[start].set(end, weight);
    this.adjacencies[end].set(start, weight);
  }

  public hasEdge(start: number, end: number): boolean {
    if (!this.inBounds(start, end)) {
      throw new Error(`The indices of nodes must be >= 0 and < ${this.size}`);
    }
    return this.adjacencies[start].has(end);
  }

  public neighbors(vertex: number): Set<number> {
    if (vertex < 0 || vertex >= this.size) {
      throw new Error(`The indices of nodes must be >= 0 and < ${this.size}`);
    }
    return new Set(this.adjacencies[vertex].keys());
  }

  public shortestPath(start: number, end: number): number[] {
    if (!this.inBounds(start, end)) {
      throw new Error(`The indices of nodes must be >= 0 and < ${this.size}`);
    }
    const distanceComparator = (a: number[], b: number[]) => {
      if (a[1] === Infinity && b[1] === Infinity) return 0;
      return a[1] - b[1];
    };
    const queue = new Heap(distanceComparator);
    queue.init([[start, 0]]);
    const dist = Array.from({length: this.size}, () => Infinity);
    dist[start] = 0;
    const prev = new Map<number, number>();
    while (queue.length > 0) {
      const [currVertex, currDist] = queue.pop()!;
      if (currVertex === end) break;
      if (currDist > dist[currVertex]) continue;
      for (const [neighbor, weight] of this.adjacencies[currVertex]) {
        const newDist = currDist + weight;
        if (newDist < dist[neighbor]) {
          dist[neighbor] = newDist;
          prev.set(neighbor, currVertex);
          queue.push([neighbor, newDist]);
        }
      }
    }
    let currVertex: number = end,
      prevVertex: number | undefined;
    const path: number[] = [end];
    while ((prevVertex = prev.get(currVertex)) !== undefined) {
      currVertex = prevVertex;
      path.push(currVertex);
    }
    path.reverse();
    return path;
  }

  private edgeToString(i: number, j: number): string {
    return `${destinations.get(this.revIndexMap.get(i)!)} to ` +
      `${destinations.get(this.revIndexMap.get(j)!)} in ` +
      `${this.adjacencies[i].get(j)} segments`;
  }

  public pathToStrings(path: number[]): string[] {
    const result = [this.edgeToString(path[0], path[1])];
    for (let i = 1; i + 1 < path.length; i++) {
      result.push(this.edgeToString(path[i], path[i + 1]));
    }
    return result;
  }
}

