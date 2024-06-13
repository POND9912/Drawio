import React, { useState } from 'react';
import DrawioEditorNew from './components/DrawioEditorNew';
import './App.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
const App = () => {
  const _list_drawio = [
    {
      id: uuidv4(),
      name: 'TEST1',
      xml: ``,
    },
  ];
  const [listDrawio, setListDrawio] = useState(_list_drawio);

  console.log(listDrawio);
  const callback = (id, xml) => {
    const index = listDrawio.findIndex(w => w.id === id);
    if (index !== -1) {
      const updatedList = listDrawio.map((item, i) =>
        i === index ? { ...item, xml } : item
      );
      setListDrawio(updatedList);
    }
  };

  const addNewDiagram = () => {
    const name = prompt("Enter the name of the new diagram:"); // Prompt for diagram name
    if (name) {
      const id = uuidv4(); // Generate UUID
      const newDiagram = {
        id,
        name,
        xml: '',
      };
      const updatedList = [...listDrawio, newDiagram];
      localStorage.setItem(`${newDiagram.id}`, newDiagram.xml);
      setListDrawio(updatedList);
    }
  };

  const deleteDiagram = (id) => {
    const updatedList = listDrawio.filter(item => item.id !== id);
    setListDrawio(updatedList);
  };

  return (
    <div className="container">
      <h1 style={{ fontFamily: 'Oxanium', margin: '10px' }}>
        Drawio Demo
      </h1>
      <button className="btn-add" onClick={addNewDiagram} style={{ marginBottom: '10px' }}>ADD DIAGRAM</button>
      {listDrawio.map((e) => (
        <DrawioEditorNew key={e.id} id={e.id} name={e.name} xml={e.xml} callback={callback} onDelete={deleteDiagram} />
      ))}
    </div>
  );
};

export default App;
