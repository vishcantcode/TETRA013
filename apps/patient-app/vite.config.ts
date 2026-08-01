import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@healthsense/clinical-models': path.resolve(__dirname, '../../packages/clinical-models/src'),
      '@healthsense/clinical-intelligence': path.resolve(__dirname, '../../packages/clinical-intelligence/src'),
      '@healthsense/clinical-explainability': path.resolve(__dirname, '../../packages/clinical-explainability/src'),
      '@healthsense/clinical-referrals': path.resolve(__dirname, '../../packages/clinical-referrals/src'),
      '@healthsense/medical-document-intelligence': path.resolve(__dirname, '../../packages/medical-document-intelligence/src'),
      '@healthsense/patient-engagement': path.resolve(__dirname, '../../packages/patient-engagement/src'),
      '@healthsense/patient-digital-twin': path.resolve(__dirname, '../../packages/patient-digital-twin/src'),
      '@healthsense/population-health': path.resolve(__dirname, '../../packages/population-health/src'),
      '@healthsense/types': path.resolve(__dirname, '../../packages/types/src'),
      '@healthsense/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
});
