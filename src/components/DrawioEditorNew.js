import React, { useEffect, useState } from 'react';
import './DrawioEditor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons'; // นำเข้าไอคอนที่ต้องการ

const DrawioEditorNew = ({ id, xml, callback, callbackClick }) => {
    const [drawioTab, setDrawioTab] = useState(null);
    useEffect(() => {
        const onMessage = (event) => {
            if (event.origin !== 'https://embed.diagrams.net') return;
            if (event.data.length > 0 && event.data.substring(0, 1) === '{') {
                const msg = JSON.parse(event.data);

                // 
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

        const onStorageChange = (event) => {
            if (event.key === 'drawioEvent') {
                const message = JSON.parse(event.newValue);
                if (message.event === 'closeDrawioTab' && message.editorId === id) {
                    window.focus();
                }
            }
        };

        window.addEventListener('storage', onStorageChange);

        return () => {
            window.removeEventListener('message', onMessage);
            window.removeEventListener('storage', onStorageChange);
        };
    }, [drawioTab]);

    const openDrawio = () => {
        const tab = window.open(`https://embed.diagrams.net/?embed=1&proto=json&editorId=${id}`, '_blank');
        setDrawioTab(tab);
        const sendLoadMessage = () => {
            tab.postMessage(JSON.stringify({ action: 'load', autosave: 0, xml, editorId: id }), 'https://embed.diagrams.net');
        };

        setTimeout(sendLoadMessage, 2000);
    };

    return (
        <div className="drawio-container" style={{ margin: '10px' }}>
            <p>Diagrams {id}</p>
            <button className="btn-upload" onClick={openDrawio}>
                <FontAwesomeIcon icon={faEdit} />
            </button>
        </div>
    );
};

export default DrawioEditorNew;
