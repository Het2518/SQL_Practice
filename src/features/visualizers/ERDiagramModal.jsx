import React from 'react';
import { InteractiveERDiagram } from './InteractiveERDiagram';

export function ERDiagramModal({ dbName, onClose }) {
  return <InteractiveERDiagram dbName={dbName} onClose={onClose} />;
}