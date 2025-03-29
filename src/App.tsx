import React, { useState } from 'react';
import './App.css';
import {destinations, routes} from './Routes';
import {Graph} from './Graph';

type SetStateFn = (value: string) => void;

interface SelectDestinationProps {
  id: string;
  value: string;
  handler: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function findRoutes(start: string, end: string): string[] {
  if (start === '' || end === '') {
    return ['Invalid selection'];
  } else if (start === end) {
    const startDesc = destinations.get(start);
    return [`${startDesc} to ${startDesc} in 0 segments`];
  }
  const graph = new Graph(destinations);
  graph.addRoutes(routes);
  const path = graph.shortestPath(start, end);
  return graph.pathToStrings(path);
}

const SelectDestination: React.FC<SelectDestinationProps> = ({id, value, handler}) => {
  return (
    <select id={id} value={value} onChange={handler}>
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
        {findRoutes(startDest, endDest).map((routeDescription, index) =>
          <li key={index}>{routeDescription}</li>
        )}
      </ul>
    </>
  )
}

export default App
