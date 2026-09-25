import React from 'react';
import { UnifiedCertificateSection } from '../../../components/common';
export { GRADE } from '../../../components/common/UnifiedCertificateSection';

export default function CertificateSection(props) {
  return (
    <UnifiedCertificateSection
      expNumber={8}
      expTitle="Identify Graph Entities & Probabilistic Retrieval Performance"
      {...props}
    />
  );
}
