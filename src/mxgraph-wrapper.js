import mx from 'mxgraph';

const mxgraph = mx({
  mxImageBasePath: 'mxgraph/images',
  mxBasePath: 'mxgraph'
});

export const {
  mxGraph,
  mxGraphModel,
  mxCodec,
  mxUtils,
  mxConstants,
  mxEditor,
  mxGeometry,
  mxPoint,
  mxEvent,
  mxRubberband,
  mxKeyHandler,
  mxDrawioCodec
} = mxgraph;
