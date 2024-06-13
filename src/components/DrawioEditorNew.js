import React, { useEffect, useState } from 'react';
import './DrawioEditor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';

const DrawioEditorNew = ({ id, xml, callback, onDelete }) => {
    const [drawioTab, setDrawioTab] = useState(null);

    useEffect(() => {
        const onMessage = (event) => {
            if (event.origin !== 'https://embed.diagrams.net') return;
            if (event.data.length > 0 && event.data.substring(0, 1) === '{') {
                const msg = JSON.parse(event.data);

                if (msg.event === 'save') {
                    const xml = msg.xml;
                    if (drawioTab) {
                        drawioTab.postMessage(JSON.stringify({ action: 'exit' }), 'https://embed.diagrams.net');
                        callback(id, xml);
                    }
                } else if (msg.event === 'exit') {
                    if (drawioTab) {
                        drawioTab.close();
                    }
                }
            }
        };

        window.addEventListener('message', onMessage);

        return () => {
            window.removeEventListener('message', onMessage);
        };
    }, [drawioTab, callback, id]);

    const openDrawio = () => {
        const tab = window.open(`https://embed.diagrams.net/?embed=1&proto=json&editorId=${id}`, '_blank');
        setDrawioTab(tab);
        const sendLoadMessage = () => {
            tab.postMessage(JSON.stringify({ action: 'load', autosave: 0, xml, editorId: id }), 'https://embed.diagrams.net');
        };

        setTimeout(sendLoadMessage, 2000);
    };

    const downloadXML = () => {
        const element = document.createElement('a');
        const file = new Blob([xml], { type: 'text/xml' });
        element.href = URL.createObjectURL(file);
        element.download = `${id}.xml`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };

    return (
        <div className="drawio-container" style={{ margin: '10px' }}>
            <p>Diagrams {id}</p>
            <div style={{ display: 'flex' }}>
                <button className="btn-upload" onClick={openDrawio}>
                    <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="btn-download" onClick={downloadXML}>
                    <FontAwesomeIcon icon={faDownload} />
                </button>
                <button className="btn-delete" onClick={() => onDelete(id)}>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
        </div>
    );
};

export default DrawioEditorNew;
