import React, { useState } from 'react';
import {destinations, routes} from './Routes';
import {Graph} from './Graph';

type SetStateFn = (value: string) => void;

interface SelectDestinationProps {
  id: string;
  value: string;
  handler: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  ariaLabel?: string;
}

function findRoutes(start: string, end: string, restrictedEdges: [string, string][]): string[] {
  if (start === '' || end === '') {
    return ['Invalid selection'];
  } else if (start === end) {
    const startDesc = destinations.get(start);
    return [`${startDesc} to ${startDesc} in 0 segments`];
  }
  const graph = new Graph(destinations);
  const filteredRoutes = routes.filter((r) => {
    return !restrictedEdges.some((edge) => (edge[0] === r.start && edge[1] === r.end) ||
      (edge[1] === r.start && edge[0] === r.end));
  });
  console.log(restrictedEdges);
  console.log(filteredRoutes);
  graph.addRoutes(filteredRoutes);
  const path = graph.shortestPath(start, end);
  if (path === undefined) return ['No path exists.'];
  return graph.pathToStrings(path);
}

const SelectDestination: React.FC<SelectDestinationProps> = ({id, value, handler, ariaLabel}) => {
  return (
    <select id={id} value={value} onChange={handler} aria-label={ariaLabel}>
      <option value="">No Selection</option>
      {[...destinations.keys()].map((destKey, index) => 
        <option key={index} value={destKey}>
          {destinations.get(destKey)}
        </option>
      )}
    </select>
  )
}

function App() {

  const [startDest, setStartDest] = useState('');
  const [endDest, setEndDest] = useState('');
  const [restrictedEdges, setRestrictedEdges] = useState<[string, string][]>([]);
  const [startDestToAdd, setStartDestToAdd] = useState('');
  const [endDestToAdd, setEndDestToAdd] = useState('');

  const addItemHandler = () => {
    console.log('----------');
    console.log(startDestToAdd);
    console.log(endDestToAdd);
    console.log('----------');
    if (startDestToAdd === '' || endDestToAdd === '' ||
      restrictedEdges.includes([startDestToAdd, endDestToAdd])
    ) {
      return;
    }
    setRestrictedEdges(restrictedEdges.concat([[startDestToAdd, endDestToAdd]]));
  }

  const makeHandler = (setter: SetStateFn) => {
    return (e: React.ChangeEvent<HTMLSelectElement>) => setter(e.target.value);
  }

  return (
    <>
      <h2>Ticket To Ride Route Explorer</h2>
      <br />
      <label htmlFor="startDest">Select start: </label>
      <SelectDestination id="startDest" value={startDest} handler={makeHandler(setStartDest)} />
      <br />
      <label htmlFor="endDest">Select end: </label>
      <SelectDestination id="endDest" value={endDest} handler={makeHandler(setEndDest)} />
      <br />
      <ul>
        {findRoutes(startDest, endDest, restrictedEdges).map((routeDescription, index) =>
          <li key={index}>{routeDescription}</li>
        )}
      </ul>
      <br />
      <table>
        <thead>
          <tr>
            <th scope="col">Start</th>
            <th scope="col">End</th>
            <th scope="col">Control</th>
          </tr>
        </thead>
        <tbody>
        {restrictedEdges.map(([start, end]) =>
            <tr key={`${start}-${end}`}>
              <td>{destinations.get(start)}</td>
              <td>{destinations.get(end)}</td>
              <td>
                <button onClick={() => {
                  setRestrictedEdges(restrictedEdges.filter((edge) => 
                    !(edge[0] == start && edge[1] == end)));
                }}>Delete</button>
              </td>
            </tr>
          )}
          <tr>
            <td>
              <SelectDestination id="addStartToTable"
                value={startDestToAdd}
                handler={makeHandler(setStartDestToAdd)}
                ariaLabel="Select start of edge" />
            </td>
            <td>
              <SelectDestination id="addEndToTable"
                value={endDestToAdd}
                handler={makeHandler(setEndDestToAdd)}
                ariaLabel="Select end of edge" />
            </td>
            <td>
              <button onClick={addItemHandler}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default App;
