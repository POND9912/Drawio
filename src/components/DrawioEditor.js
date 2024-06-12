import React, { useEffect, useState } from 'react';
import './DrawioEditor.css';

const DrawioEditor = ({ editorId }) => {
    const [diagramXml, setDiagramXml] = useState({});
    const [drawioTab, setDrawioTab] = useState(null);

    useEffect(() => {
        // console.log(`Editor ID: ${editorId}`);
        const storedDiagramXml = localStorage.getItem(`diagramXml_${editorId}`);
        // console.log(`Stored Diagram XML: ${storedDiagramXml}`);
        if (storedDiagramXml) {
            console.log('Loading stored diagram XML');
            // setDiagramXml(storedDiagramXml);
        } else {
            console.log('Creating initial XML');
            const initialXml = `<mxfile host="embed.diagrams.net" modified="2024-06-12T08:43:00.344Z" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" version="24.5.3" etag="bawc4bO6AuQu17d2CYFa" type="embed">
                <diagram id="${editorId}" name="หน้า-1">
                    <mxGraphModel dx="1050" dy="596" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
                        <root>
                            <mxCell id="0" />
                            <mxCell id="1" parent="0" />
                            <mxCell id="2" value="Editor ${editorId}" parent="1" vertex="1">
                                <mxGeometry x="40" y="40" width="80" height="30" as="geometry" />
                            </mxCell>
                        </root>
                    </mxGraphModel>
                </diagram>
            </mxfile>`;
            console.log(`Initial XML: ${initialXml}`);
            setDiagramXml({
                ...diagramXml,
                [`xml_${editorId}`]: initialXml
            });
            localStorage.setItem(`diagramXml_${editorId}`, initialXml);
        }

        const onMessage = (event) => {
            if (event.origin !== 'https://embed.diagrams.net') return;
            if (event.data.length > 0 && event.data.substring(0, 1) === '{') {
                const msg = JSON.parse(event.data);
                console.log(`onMessage: ${msg.event}`);
                if (msg.event === 'save') {
                    const xml = msg.xml;
                    // console.log("xml" ,xml);
                    setDiagramXml({
                        ...diagramXml,
                        [`xml_${editorId}`]: xml
                    });
                    localStorage.setItem(`diagramXml_${editorId}`, xml);
                    localStorage.setItem(`drawioEvent_${editorId}`, JSON.stringify({ event: 'closeDrawioTab', editorId }));

                    if (drawioTab) {
                        drawioTab.postMessage(JSON.stringify({ action: 'exit' }), 'https://embed.diagrams.net');
                    }
                } else if (msg.event === 'exit') {
                    if (drawioTab) {
                        drawioTab.close();
                        setDrawioTab(null);
                    }
                }
            }
        };

        window.addEventListener('message', onMessage);

        const onStorageChange = (event) => {
            if (event.key === 'drawioEvent') {
                const message = JSON.parse(event.newValue);
                if (message.event === 'closeDrawioTab' && message.editorId === editorId) {
                    window.focus();
                }
            }
        };

        window.addEventListener('storage', onStorageChange);

        return () => {
            window.removeEventListener('message', onMessage);
            window.removeEventListener('storage', onStorageChange);
        };
    }, [drawioTab, editorId]);

    const openDrawio = () => {
        const tab = window.open(`https://embed.diagrams.net/?embed=1&proto=json&editorId=${editorId}`, '_blank');
        setDrawioTab(tab);

        const sendLoadMessage = () => {
            if (diagramXml[`xml_${editorId}`]) {
                tab.postMessage(JSON.stringify({ action: 'load', autosave: 1, xml: diagramXml[`xml_${editorId}`] }), 'https://embed.diagrams.net');
            } else {
                tab.postMessage(JSON.stringify({ action: 'load', autosave: 1 }), 'https://embed.diagrams.net');
            }
        };

        setTimeout(sendLoadMessage, 2000);
    };

    return (
        <div className="drawio-container">
            <button onClick={openDrawio}>Open {editorId}</button>
        </div>
    );
};

export default DrawioEditor;
