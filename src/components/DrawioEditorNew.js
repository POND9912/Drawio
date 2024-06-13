import React, { useEffect, useState, useRef } from 'react';
import './DrawioEditor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faDownload, faFileImage } from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';
import mxgraph from 'mxgraph';

const { mxClient, mxGraph, mxCodec, mxUtils, mxSvgCanvas2D, mxRectangle } = mxgraph();

const DrawioEditorNew = ({ id, xml, callback, onDelete }) => {
    const [drawioTab, setDrawioTab] = useState(null);
    const imageRef = useRef(null);

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

    useEffect(() => {
        if (xml) {
            renderImageFromXML(xml);
        }
    }, [xml]);

    const openDrawio = () => {
        const tab = window.open(`https://embed.diagrams.net/?embed=1&proto=json&editorId=${id}`, '_blank');
        setDrawioTab(tab);
        const sendLoadMessage = () => {
            tab.postMessage(JSON.stringify({ action: 'load', autosave: 0, xml, editorId: id }), 'https://embed.diagrams.net');
        };

        setTimeout(sendLoadMessage, 2000);
    };

    const renderImageFromXML = (xml) => {
        if (!mxClient.isBrowserSupported()) {
            console.error('Browser is not supported!');
            return;
        }

        const container = document.createElement('div');
        container.style.visibility = 'hidden';
        document.body.appendChild(container);

        const graph = new mxGraph(container);
        const doc = mxUtils.parseXml(xml);
        const codec = new mxCodec(doc);
        codec.decode(doc.documentElement, graph.getModel());

        const bounds = graph.getGraphBounds();
        const svgCanvas = new mxSvgCanvas2D(document.createElement('svg'));
        svgCanvas.translate = true;
        svgCanvas.scale(1);

        const svgRoot = svgCanvas.root;
        svgRoot.setAttribute('width', Math.ceil(bounds.x + bounds.width));
        svgRoot.setAttribute('height', Math.ceil(bounds.y + bounds.height));
        svgRoot.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        const background = svgRoot.ownerDocument.createElementNS(svgRoot.namespaceURI, 'rect');
        background.setAttribute('width', '100%');
        background.setAttribute('height', '100%');
        background.setAttribute('fill', 'white');
        svgRoot.appendChild(background);

        const xmlCanvas = new mxSvgCanvas2D(svgRoot);
        const graphModel = graph.getModel();

        graphModel.beginUpdate();
        try {
            const cells = graphModel.cells;
            for (const id in cells) {
                const cell = cells[id];
                if (graphModel.isVertex(cell)) {
                    const state = graph.view.getState(cell);
                    if (state) {
                        graph.cellRenderer.paintVertexShape(xmlCanvas, state);
                    }
                } else if (graphModel.isEdge(cell)) {
                    const state = graph.view.getState(cell);
                    if (state) {
                        graph.cellRenderer.paintEdgeShape(xmlCanvas, state);
                    }
                }
            }
        } finally {
            graphModel.endUpdate();
        }

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgRoot);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        if (imageRef.current) {
            imageRef.current.src = url;
        }

        document.body.removeChild(container);
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
            <img ref={imageRef} src="" alt="Diagram" />
        </div>
    );
};

export default DrawioEditorNew;
