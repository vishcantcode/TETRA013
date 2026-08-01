import { MedicalDocumentPayload } from '../interfaces/MedicalDocument';
import { OCRResult } from '../interfaces/OCRResult';
import { IOCRProvider, MockOCRProvider } from '../services/OCRAdapter';
import { OCRPostProcessor } from '../utils/OCRPostProcessor';

export class OCRPipeline {
  private ocrProvider: IOCRProvider;

  constructor(provider?: IOCRProvider) {
    this.ocrProvider = provider || new MockOCRProvider();
  }

  public async runOCR(document: MedicalDocumentPayload): Promise<OCRResult> {
    const rawResult = await this.ocrProvider.extractText(document);
    const cleanedText = OCRPostProcessor.cleanOCRText(rawResult.fullText);

    return {
      ...rawResult,
      fullText: cleanedText
    };
  }
}
