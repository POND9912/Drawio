import React, { useEffect, useState } from 'react';
import './DrawioEditor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faDownload, faFileImage } from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';
import mxgraph from 'mxgraph';

const { mxClient, mxGraph, mxCodec, mxUtils } = mxgraph();

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

    const downloadJPG = () => {
        if (!mxClient || !mxClient.isBrowserSupported()) {
            console.error('mxGraph library is not loaded or browser is not supported');
            return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.overflow = 'hidden';
        container.style.width = '1px';
        container.style.height = '1px';
        document.body.appendChild(container);

        const graph = new mxGraph(container);
        const decoder = new mxCodec(doc);
        const model = graph.getModel();
        decoder.decode(doc.documentElement, model);

        const svgRoot = container.querySelector('svg');
        if (!svgRoot) {
            console.error('SVG element not found in the provided XML');
            document.body.removeChild(container);
            return;
        }

        const svgString = new XMLSerializer().serializeToString(svgRoot);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                saveAs(blob, `${id}.jpg`);
                document.body.removeChild(container);
            }, 'image/jpeg');
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    };

    return (
        <div className="drawio-container" style={{ margin: '10px' }}>
            <p>Diagrams {id}</p>
            <div style={{ display: 'flex' }}>
                <button className="btn-upload" onClick={openDrawio}>
                    <FontAwesomeIcon icon={faEdit} />
                </button>
                {/* <button className="btn-download" onClick={downloadXML}>
                    <FontAwesomeIcon icon={faDownload} />
                </button>
                <button className="btn-download" onClick={downloadJPG}>
                    <FontAwesomeIcon icon={faFileImage} />
                </button> */}
                <button className="btn-delete" onClick={() => onDelete(id)}>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
        </div>
    );
};

export default DrawioEditorNew;
