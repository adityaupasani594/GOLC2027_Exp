import React from 'react';
import { UnifiedCertificateSection } from '../../../components/common';
export { GRADE } from '../../../components/common/UnifiedCertificateSection';

export default function CertificateSection(props) {
  return (
    <UnifiedCertificateSection
      expNumber={11}
      expTitle="Design a Knowledge Graph Schema and Import Data"
      {...props}
    />
  );
}
