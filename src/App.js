import React, { useState } from 'react';
import DrawioEditorNew from './components/DrawioEditorNew';
import './App.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

const App = () => {
  const _list_drawio = [
    {
      id: 'editor1',
      xml: ``,
    },
  ];
  const [listDrawio, setListDrawio] = useState(_list_drawio);

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
    const id = listDrawio.length + 1;
    const newDiagram = {
      id: `editor${id}`,
      xml: ``,
    };
    const updatedList = [...listDrawio, newDiagram];
    localStorage.setItem(`${newDiagram.id}`, newDiagram.xml);
    setListDrawio(updatedList);
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
      <button className="btn-add" onClick={addNewDiagram} style={{ marginBottom: '10px' }}>ADD DIAGEAMS</button>
      {listDrawio.map((e) => (
        <DrawioEditorNew key={e.id} id={e.id} xml={e.xml} callback={callback} />
      ))}
    </div>
  );
};

export default App;
