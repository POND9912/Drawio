import React, { useEffect, useState } from 'react';

const DrawioSVGViewer = ({ xml }) => {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    const mxGraphModel = xmlDoc.querySelector('mxGraphModel');
    if (!mxGraphModel) {
      console.error('mxGraphModel element not found in XML');
      return;
    }

    const root = mxGraphModel.querySelector('root');
    if (!root) {
      console.error('root element not found in XML');
      return;
    }

    const mxCells = root.querySelectorAll('mxCell');
    let svgContent = '';

    mxCells.forEach(mxCell => {
      const vertex = mxCell.getAttribute('vertex');
      const edge = mxCell.getAttribute('edge');
      const style = mxCell.getAttribute('style');

      if (vertex === '1') {
        const mxGeometry = mxCell.querySelector('mxGeometry');
        if (mxGeometry) {
          const x = mxGeometry.getAttribute('x');
          const y = mxGeometry.getAttribute('y');
          const width = mxGeometry.getAttribute('width');
          const height = mxGeometry.getAttribute('height');

          if (x && y && width && height) {
            if (style.includes('ellipse')) {
              svgContent += `<ellipse cx="${+x + +width / 2}" cy="${+y + +height / 2}" rx="${width / 2}" ry="${height / 2}" stroke="black" fill="transparent" />`;
            } else if (style.includes('shape=parallelogram')) {
              const points = `${x},${y + height} ${+x + +width},${y + height} ${+x + +width - 20},${y} ${x - 20},${y}`;
              svgContent += `<polygon points="${points}" stroke="black" fill="transparent" />`;
            } else if (style.includes('shape=triangle')) {
              const points = `${+x + +width / 2},${y} ${x},${+y + +height} ${+x + +width},${+y + +height}`;
              svgContent += `<polygon points="${points}" stroke="black" fill="transparent" />`;
            } else if (style.includes('rhombus')) {
              const points = `${+x + +width / 2},${y} ${+x + +width},${+y + +height / 2} ${+x + +width / 2},${+y + +height} ${x},${+y + +height / 2}`;
              svgContent += `<polygon points="${points}" stroke="black" fill="transparent" />`;
            } else {
              svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="black" fill="transparent" />`;
            }
          } else {
            console.error('One or more attributes (x, y, width, height) are missing in mxGeometry');
          }
        } else {
          console.error('mxGeometry element not found in mxCell');
        }
      } else if (edge === '1') {
        const mxGeometry = mxCell.querySelector('mxGeometry');
        if (mxGeometry) {
          const points = mxGeometry.getAttribute('points');
          if (points) {
            const pointsArray = points.split(' ');
            if (pointsArray.length >= 2) {
              const startPoint = pointsArray[0].split(',');
              const endPoint = pointsArray[1].split(',');
              if (startPoint.length === 2 && endPoint.length === 2) {
                const startX = startPoint[0];
                const startY = startPoint[1];
                const endX = endPoint[0];
                const endY = endPoint[1];

                svgContent += `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="black" />`;
              } else {
                console.error('Invalid format of points attribute in mxGeometry for edge');
              }
            } else {
              console.error('Invalid format of points attribute in mxGeometry for edge');
            }
          } else {
            console.error('Points attribute not found in mxGeometry for edge');
          }
        } else {
          console.error('mxGeometry element not found in mxCell for edge');
        }
      }
    });

    setSvgContent(svgContent);
  }, [xml]);

  return (
    <div className="drawio-svg-viewer">
      <h2>Diagram Viewer</h2>
      <svg width="1000" height="800">
        <g dangerouslySetInnerHTML={{ __html: svgContent }} />
      </svg>
    </div>
  );
};

export default DrawioSVGViewer;
