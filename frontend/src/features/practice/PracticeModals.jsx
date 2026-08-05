import React, { Suspense } from 'react';
import { convertSubqueryToCTE, hasSubquery } from '@/utils/sqlAnalysis';

export const PracticeModals = React.memo(function PracticeModals({
  showERDiagram,
  setShowERDiagram,
  db,
  previewTableName,
  setPreviewTableName,
  showCteModal,
  setShowCteModal,
  sql,
  setSql,
  joinAnalysisData,
  setJoinAnalysisData,
  ERDiagramModal,
  TablePreviewModal,
  CteConverterModal,
  AnimatedJoinVisualizer,
}) {
  return (
    <>
      <Suspense fallback={null}>
        {showERDiagram && (
          <ERDiagramModal dbName={db} onClose={() => setShowERDiagram(false)} />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {previewTableName && (
          <TablePreviewModal
            db={db}
            tableName={previewTableName}
            onClose={() => setPreviewTableName(null)}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <CteConverterModal
          isOpen={showCteModal}
          onClose={() => setShowCteModal(false)}
          originalSql={sql}
          convertedSql={hasSubquery(sql) ? convertSubqueryToCTE(sql) : sql}
          onUseConverted={(newSql) => {
            setSql(newSql);
            setShowCteModal(false);
          }}
        />
      </Suspense>

      <Suspense fallback={null}>
        {joinAnalysisData && (
          <AnimatedJoinVisualizer
            isOpen={!!joinAnalysisData}
            onClose={() => setJoinAnalysisData(null)}
            executeQuery={joinAnalysisData.db}
            sql={joinAnalysisData.sql}
          />
        )}
      </Suspense>
    </>
  );
});
