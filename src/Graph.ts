import {Heap} from 'heap-js';
import {Route, destinations} from './Routes';

export class Graph {
  private adjacencies: Map<string, Map<string, number>>;
  public readonly size: number;
  public readonly vertexNames: Map<string, string>;

  constructor(vertexNames: Map<string, string>) {
    this.vertexNames = vertexNames;
    this.size = vertexNames.size;
    this.adjacencies = new Map();
    for (const vertex of vertexNames.keys()) {
      this.adjacencies.set(vertex, new Map());
    }
  }

  public addRoutes(routes: Route[]): void {
    for (const route of routes) {
      this.addEdge(route.start, route.end, route.segments);
    }
  }

  public addEdge(start: string, end: string, weight: number): void {
    this.adjacencies.get(start)!.set(end, weight);
    this.adjacencies.get(end)!.set(start, weight);
  }

  public neighbors(vertex: string): Set<string> {
    return new Set(this.adjacencies.get(vertex)!.keys());
  }

  public shortestPath(start: string, end: string): string[] {
    const distanceComparator = (a: [string, number], b: [string, number]) => {
      if (a[1] === Infinity && b[1] === Infinity) return 0;
      return a[1] - b[1];
    };
    const queue = new Heap(distanceComparator);
    queue.init([[start, 0]]);
    const dist = new Map<string, number>();
    for (const vertex of this.vertexNames.keys()) {
      dist.set(vertex, Infinity);
    }
    dist.set(start, 0);
    const prev = new Map<string, string>();
    while (queue.length > 0) {
      const [currVertex, currDist] = queue.pop()!;
      if (currVertex === end) break;
      if (currDist > dist.get(currVertex)!) continue;
      for (const [neighbor, weight] of this.adjacencies.get(currVertex)!) {
        const newDist = currDist + weight;
        if (newDist < dist.get(neighbor)!) {
          dist.set(neighbor, newDist);
          prev.set(neighbor, currVertex);
          queue.push([neighbor, newDist]);
        }
      }
    }
    let currVertex: string= end,
      prevVertex: string | undefined;
    const path: string[] = [end];
    while ((prevVertex = prev.get(currVertex)) !== undefined) {
      currVertex = prevVertex;
      path.push(currVertex);
    }
    path.reverse();
    return path;
  }

  private edgeToString(v1: string, v2: string): string {
    return `${destinations.get(v1)} to ` +
      `${destinations.get(v2)} in ` +
      `${this.adjacencies.get(v1)!.get(v2)} segments`;
  }

  public pathToStrings(path: string[]): string[] {
    const result = [this.edgeToString(path[0], path[1])];
    for (let i = 1; i + 1 < path.length; i++) {
      result.push(this.edgeToString(path[i], path[i + 1]));
    }
    return result;
  }
}

