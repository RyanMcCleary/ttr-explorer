import React, { useState } from 'react';
import {destinations, routes} from './Routes';
import {Graph} from './Graph';
import './App.css';
import 'font-awesome/css/font-awesome.css';

type SetStateFn = (value: string) => void;

interface SelectDestinationProps {
  id: string;
  value: string;
  handler: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
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

function getNeighbors(destination: string): string[] {
  if (destination === '') return [...destinations.keys()];
  const result = new Set<string>();
  for (const { start: u, end: v } of routes) {
    if (destination === u) result.add(v);
    else if (destination === v) result.add(u);
  }
  return [...result];
}

const SelectDestination: React.FC<SelectDestinationProps> = ({id, value, handler, options, ariaLabel}) => {
  return (
    <select id={id} value={value} onChange={handler} aria-label={ariaLabel}>
      <option value="">No Selection</option>
      {options.map((destKey, index) => 
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
      <SelectDestination id="startDest" value={startDest}
        handler={makeHandler(setStartDest)} options={[...destinations.keys()]} />
      <br />
      <label htmlFor="endDest">Select end: </label>
      <SelectDestination id="endDest" value={endDest}
        handler={makeHandler(setEndDest)} options={[...destinations.keys()]} />
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
            <th scope="col">Add/Delete</th>
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
                }}
                aria-label="Delete">
                  <i className="fa fa-trash fa-lg delete-icon"></i>
                </button>
              </td>
            </tr>
          )}
          <tr>
            <td>
              <SelectDestination id="addStartToTable"
                value={startDestToAdd}
                handler={makeHandler(setStartDestToAdd)}
                options={getNeighbors(endDestToAdd)}
                ariaLabel="Select start of edge" />
            </td>
            <td>
              <SelectDestination id="addEndToTable"
                value={endDestToAdd}
                handler={makeHandler(setEndDestToAdd)}
                options={getNeighbors(startDestToAdd)}
                ariaLabel="Select end of edge" />
            </td>
            <td>
              <button onClick={addItemHandler} aria-label="Add">
                <i className="fa fa-plus fa-lg add-icon"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
    </>
  )
}

export default App;
