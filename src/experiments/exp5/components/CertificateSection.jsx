import React from 'react';
import { UnifiedCertificateSection } from '../../../components/common';
export { GRADE } from '../../../components/common/UnifiedCertificateSection';

export default function CertificateSection(props) {
  return (
    <UnifiedCertificateSection
      expNumber={5}
      expTitle="BM25 Based Document Ranking"
      {...props}
    />
  );
}
