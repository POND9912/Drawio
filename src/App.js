import React, { useState } from 'react';
import DrawioEditor from './components/DrawioEditor';
import DrawioEditorNew from './components/DrawioEditorNew';
import './App.css';
const App = () => {
  const _list_drawio = [
    {
      id: '1',
      xml: ``,
    },
  ];
  const [listDrawio, setListDrawio] = useState(_list_drawio);

  const [test, settest] = useState({
    test: '',
  })

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
      id: `${id}`,
      xml: ``,
    };
    const updatedList = [...listDrawio, newDiagram];
    localStorage.setItem(`${newDiagram.id}`, newDiagram.xml);
    setListDrawio(updatedList);
  };

  return (
    <div className="App">
      <div className="container">
        <h1 style={{ fontFamily: 'Oxanium', margin: '10px' }}>
          Drawio Demo
        </h1>
        <button className="btn-add" onClick={addNewDiagram} style={{ marginBottom: '10px' }}>ADD DIAGEAMS</button>
        {listDrawio.map((e) => (
          <DrawioEditorNew key={e.id} id={e.id} xml={e.xml} callback={callback} />
        ))}
      </div>
    </div>
  );
};

export default App;
