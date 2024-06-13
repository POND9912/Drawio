import React, { useState } from 'react';
import DrawioEditorNew from './components/DrawioEditorNew';
// import './Test.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

const Test = () => {
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
    <div>
        TEST
    </div>
  );
};

export default Test;
