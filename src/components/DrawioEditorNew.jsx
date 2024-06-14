import React, { useEffect, useState, useRef } from "react";
import "./DrawioEditor.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

const DrawioEditorNew = ({ id, name, xml, jpg, callback, onDelete }) => {
  const [drawioTab, setDrawioTab] = useState(null);
  const [imageSrc, setImageSrc] = useState(jpg);
  const imageRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== "https://embed.diagrams.net") return;
      if (event.data.length > 0 && event.data.substring(0, 1) === "{") {
        const msg = JSON.parse(event.data);
        if (msg.event === "save") {
          const xml = msg.xml;
          if (drawioTab) {
            drawioTab.postMessage(
              JSON.stringify({ action: "export", format: "svg", xml: xml }),
              "https://embed.diagrams.net"
            );
            window.currentXml = xml;
          }
        } else if (msg.event === "export") {
          const dataUrl = msg.data;
          setImageSrc(dataUrl);
          if (drawioTab) {
            drawioTab.postMessage(
              JSON.stringify({ action: "exit" }),
              "https://embed.diagrams.net"
            );
          }
          callback(id, window.currentXml, dataUrl);
        } else if (msg.event === "exit") {
          if (drawioTab) {
            drawioTab.close();
          }
        }
      }
    };

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [drawioTab, callback, id]);

  const openDrawio = () => {
    const tab = window.open(
      `https://embed.diagrams.net/?embed=1&proto=json&editorId=${id}`,
      "_blank"
    );
    setDrawioTab(tab);
    const sendLoadMessage = () => {
      tab.postMessage(
        JSON.stringify({ action: "load", autosave: 0, xml, jpg, editorId: id }),
        "https://embed.diagrams.net"
      );
    };

    setTimeout(sendLoadMessage, 2000);
  };

  const downloadImage = () => {
    const svgData = imageSrc;
    const img = new Image();
  
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
  
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const jpgData = canvas.toDataURL("image/jpeg");
  
      const link = document.createElement("a");
      link.href = jpgData;
      link.download = `${name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    img.src = svgData;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.01;
    setZoom((prevZoom) => Math.min(Math.max(prevZoom + scaleAmount, 0.1), 10));
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    startPos.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseLeave = () => {
    setDragging(false);
  };

  return (
    <div className="drawio-container" style={{ margin: "10px" }}>
      <p>{name}</p>
      <div style={{ display: "flex" }}>
        <button className="btn-upload" onClick={openDrawio}>
          <FontAwesomeIcon icon={faEdit} />
        </button>
        {imageSrc && (
          <button className="btn-download" onClick={downloadImage}>
            <FontAwesomeIcon icon={faDownload} />
          </button>
        )}
        <button className="btn-delete" onClick={() => onDelete(id)}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      {imageSrc && (
        <div
          className="drawio-image-container"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            cursor: dragging ? 'grabbing' : 'grab',
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Diagram"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: dragging ? 'none' : 'transform 0.1s ease-in-out',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DrawioEditorNew;
