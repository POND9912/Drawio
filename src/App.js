import React, { useState } from 'react';
import DrawioEditor from './components/DrawioEditor';
import DrawioEditorNew from './components/DrawioEditorNew';
import './App.css';
const App = () => {
  const _list_drawio = [
    {
      id: 'editor1',
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
      listDrawio[index].xml = xml;
      setListDrawio(listDrawio)
      settest({ ...test, test: '' });
      test.test = '';
    }
  }
  return (
    <div className="App">
      <h1 style={{ fontFamily: 'Oxanium' }}>Drawio Demo <button onClick={() => {
        const id = listDrawio.length + 1
        const xml = {
          id: `editor${id}`,
          xml: ``,
        }
        listDrawio.push(xml);
        localStorage.setItem(`${xml.id}`, xml.xml);
        setListDrawio(listDrawio)
        settest({ ...test, test: '' });
        test.test = '';
      }}>เพิ่ม</button></h1>
      {listDrawio.map((e) => (
        <DrawioEditorNew key={e.id} id={e.id} xml={e.xml} callback={callback} />
      ))}

    </div>
  );
};

export default App;
