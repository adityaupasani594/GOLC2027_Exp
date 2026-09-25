import React from 'react';
import { UnifiedCertificateSection } from '../../../components/common';
export { GRADE } from '../../../components/common/UnifiedCertificateSection';

export default function CertificateSection(props) {
  return (
    <UnifiedCertificateSection
      expNumber={10}
      expTitle="Create and Manage a Graph Database"
      {...props}
    />
  );
}
