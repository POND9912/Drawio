import React, { useState } from 'react';
import DrawioEditorNew from './components/DrawioEditorNew';
import './App.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import Test from './test';
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
    <div className="App">
      <h1 style={{ fontFamily: 'Oxanium' }}>
        Drawio Demo
        <button onClick={addNewDiagram}>เพิ่ม</button>
      </h1>
      {listDrawio.map((e) => (
        <DrawioEditorNew
          key={e.id}
          id={e.id}
          xml={e.xml}
          callback={callback}
          onDelete={deleteDiagram}
        />
      ))}
      <BrowserRouter>
        <Link to="test" >test</Link>
        <Routes>
          <Route path='/test' element={<Test />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
