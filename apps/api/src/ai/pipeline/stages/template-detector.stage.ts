import { Injectable, Logger } from '@nestjs/common';
import { ProcessingDocument, TemplateType } from '../interfaces/processing-document.interface';

@Injectable()
export class TemplateDetectorStage {
  private readonly logger = new Logger(TemplateDetectorStage.name);

  async execute(doc: ProcessingDocument): Promise<ProcessingDocument> {
    const fullText = doc.pages.map((p) => p.cleanText).join(' ');
    let templateType: TemplateType = 'GENERIC';

    if (/NTA|NATIONAL\s*TESTING\s*AGENCY|NEET\s*\(UG\)/i.test(fullText)) {
      templateType = 'NTA_OFFICIAL';
    } else if (/ALLEN|CAREER\s*INSTITUTE/i.test(fullText)) {
      templateType = 'ALLEN_TEST';
    } else if (/AAKASH|AESL|FORTNIGHTLY/i.test(fullText)) {
      templateType = 'AAKASH_FT';
    } else if (/PHYSICS\s*WALLAH|PW/i.test(fullText)) {
      templateType = 'PHYSICS_WALLAH';
    }

    doc.templateType = templateType;
    this.logger.log(`[Stage 8] Template Detector: Detected layout template ${templateType}`);
    return doc;
  }
}
