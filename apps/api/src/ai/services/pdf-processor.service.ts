import { Injectable, Logger } from '@nestjs/common';

// Lazy dynamic load of @napi-rs/canvas to prevent native DLL loading crash on platforms with App Control policies
let createCanvasFn: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const canvasMod = require('@napi-rs/canvas');
  createCanvasFn = canvasMod.createCanvas;
} catch (e: any) {
  console.warn('[PdfProcessorService] Native canvas module @napi-rs/canvas not available:', e?.message || e);
}

function safeCreateCanvas(w: number, h: number): any {
  if (typeof createCanvasFn === 'function') {
    return createCanvasFn(w, h);
  }
  throw new Error('Native canvas rendering is not supported on this platform/environment.');
}

// Polyfill DOMMatrix for Node.js if @napi-rs/canvas is missing native bindings
if (typeof (globalThis as any).DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor(init?: any) {
      if (Array.isArray(init) && init.length >= 6) {
        this.a = init[0]; this.b = init[1]; this.c = init[2];
        this.d = init[3]; this.e = init[4]; this.f = init[5];
      }
    }
  };
}

let pdfjsLibInstance: any = null;
function getPdfjsLib(): any {
  if (!pdfjsLibInstance) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      pdfjsLibInstance = require('pdfjs-dist/legacy/build/pdf.mjs');
    } catch (e: any) {
      console.warn('[PdfProcessorService] pdfjs-dist module load error:', e?.message || e);
    }
  }
  return pdfjsLibInstance;
}

export interface PageBatch {
  pages: Buffer[];           // PNG buffers (used when mode = 'vision')
  textPages?: string[];      // Raw text strings per page (used when mode = 'text')
  startPage: number;         // 1-based
  endPage: number;           // 1-based (inclusive)
  batchIndex: number;        // 0-based
  mode: 'text' | 'vision';
}

@Injectable()
export class PdfProcessorService {
  private readonly logger = new Logger(PdfProcessorService.name);

  /**
   * Processes a PDF buffer into PageBatch objects.
   * Auto-detects if the PDF has embedded native text (digital PDF) or is scanned (image PDF).
   * 
   * - Digital PDF: Extracts text directly per page (100% exact, 10x faster)
   * - Scanned PDF: Renders pages to high-DPI PNG image buffers for Vision AI
   */
  async getPageBatches(
    pdfBuffer: Buffer,
    batchSize = 4,
    scale = 2.0,
  ): Promise<PageBatch[]> {
    const startTime = Date.now();

    const pdfData = new Uint8Array(pdfBuffer);
    const pdfDoc = await getPdfjsLib().getDocument({
      data: pdfData,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    }).promise;

    const totalPages = pdfDoc.numPages;
    this.logger.log(`PDF loaded: ${totalPages} pages (batchSize=${batchSize})`);

    // Sample first 3 pages to test if PDF contains native text
    let totalSampleChars = 0;
    const sampleCount = Math.min(3, totalPages);
    for (let p = 1; p <= sampleCount; p++) {
      const page = await pdfDoc.getPage(p);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((i: any) => i.str).join(' ');
      totalSampleChars += pageText.trim().length;
    }

    const hasNativeText = totalSampleChars / sampleCount > 50;
    const mode = hasNativeText ? 'text' : 'vision';
    this.logger.log(`PDF extraction strategy: ${mode.toUpperCase()} mode (avg ${Math.round(totalSampleChars / sampleCount)} chars/page sample)`);

    const batches: PageBatch[] = [];
    let pageIndex = 0;

    while (pageIndex < totalPages) {
      const batchStart = pageIndex;
      const batchEnd = Math.min(pageIndex + batchSize, totalPages);

      if (mode === 'text') {
        const textPages: string[] = [];
        for (let p = batchStart; p < batchEnd; p++) {
          const page = await pdfDoc.getPage(p + 1);
          const extracted = await this.extractPageTextSortedByColumns(page);
          textPages.push(extracted.text);
        }

        batches.push({
          pages: [],
          textPages,
          startPage: batchStart + 1,
          endPage: batchEnd,
          batchIndex: batches.length,
          mode: 'text',
        });
      } else {
        const batchPageBuffers: Buffer[] = [];
        for (let p = batchStart; p < batchEnd; p++) {
          const pageBuffer = await this.renderPageToPng(pdfDoc, p + 1, scale);
          batchPageBuffers.push(pageBuffer);
        }

        batches.push({
          pages: batchPageBuffers,
          startPage: batchStart + 1,
          endPage: batchEnd,
          batchIndex: batches.length,
          mode: 'vision',
        });
      }

      pageIndex = batchEnd;
    }

    const elapsed = Date.now() - startTime;
    this.logger.log(
      `PDF processed [${mode.toUpperCase()}]: ${totalPages} pages → ${batches.length} batches in ${elapsed}ms`,
    );

    return batches;
  }

  /**
   * Returns the total page count of a PDF without rendering.
   */
  async getPageCount(pdfBuffer: Buffer): Promise<number> {
    const pdfData = new Uint8Array(pdfBuffer);
    const pdfDoc = await getPdfjsLib().getDocument({
      data: pdfData,
      useWorkerFetch: false,
      isEvalSupported: false,
    }).promise;
    return pdfDoc.numPages;
  }

  // ── Private: Render one page → PNG buffer ─────────────────────────────────

  private async renderPageToPng(
    pdfDoc: any,
    pageNumber: number,
    scale: number,
  ): Promise<Buffer> {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const width = Math.round(viewport.width);
    const height = Math.round(viewport.height);

    const canvas = safeCreateCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    await page.render({
      canvasContext: ctx as any,
      viewport,
      background: 'white',
    }).promise;

    return canvas.toBuffer('image/png');
  }

  /**
   * Public helper to render a single page by page number (1-based) to PNG Buffer
   */
  async renderPageToPngByPageNum(pdfBuffer: Buffer, pageNumber: number, scale = 2.0): Promise<Buffer | null> {
    try {
      const pdfData = new Uint8Array(pdfBuffer);
      const pdfDoc = await getPdfjsLib().getDocument({
        data: pdfData,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      }).promise;

      if (pageNumber < 1 || pageNumber > pdfDoc.numPages) return null;
      return this.renderPageToPng(pdfDoc, pageNumber, scale);
    } catch (err: any) {
      this.logger.error(`renderPageToPngByPageNum failed for page ${pageNumber}: ${err.message}`);
      return null;
    }
  }

  /**
   * Crops and renders the specific question region on a page canvas
   */
  async renderQuestionRegionToPng(
    pdfBuffer: Buffer,
    pageNumber: number,
    questionIndexOnPage: number,
    totalQuestionsOnPage: number,
    scale = 2.5,
  ): Promise<Buffer | null> {
    try {
      const pdfData = new Uint8Array(pdfBuffer);
      const pdfDoc = await getPdfjsLib().getDocument({
        data: pdfData,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      }).promise;

      if (pageNumber < 1 || pageNumber > pdfDoc.numPages) return null;
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const width = Math.round(viewport.width);
      const fullHeight = Math.round(viewport.height);

      const fullCanvas = safeCreateCanvas(width, fullHeight);
      const ctx = fullCanvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, fullHeight);

      await page.render({
        canvasContext: ctx as any,
        viewport,
        background: 'white',
      }).promise;

      const topHeaderOffset = Math.round(fullHeight * 0.04);
      const usableHeight = fullHeight - topHeaderOffset - Math.round(fullHeight * 0.02);

      const safeTotal = Math.max(1, totalQuestionsOnPage);
      const sliceHeight = Math.round(usableHeight / safeTotal);

      const yStart = topHeaderOffset + Math.max(0, questionIndexOnPage * sliceHeight);
      const cropHeight = Math.min(sliceHeight + 80, fullHeight - yStart);

      const cropCanvas = safeCreateCanvas(width, cropHeight);
      const cropCtx = cropCanvas.getContext('2d');
      cropCtx.fillStyle = '#FFFFFF';
      cropCtx.fillRect(0, 0, width, cropHeight);
      cropCtx.drawImage(fullCanvas, 0, yStart, width, cropHeight, 0, 0, width, cropHeight);

      cropCtx.fillStyle = '#FFFFFF';
      cropCtx.fillRect(0, 0, width, 25);
      cropCtx.fillRect(0, cropHeight - 35, width, 35);

      return cropCanvas.toBuffer('image/png');
    } catch (err: any) {
      this.logger.error(`renderQuestionRegionToPng failed for page ${pageNumber}: ${err.message}`);
      return null;
    }
  }

  /**
   * Sorts text items on a page by two-column layout (Left Column top-to-bottom, Right Column top-to-bottom)
   */
  async extractPageTextSortedByColumns(page: any): Promise<{ text: string; isInstructionPage: boolean }> {
    try {
      const textContent = await page.getTextContent();
      const items = (textContent.items || []) as any[];
      if (items.length === 0) return { text: '', isInstructionPage: false };

      const rawFullText = items.map((i) => i.str).join(' ');
      const isInstructionPage = /important instructions|candidate name|roll no|test booklet code|read the following instructions/i.test(rawFullText);

      const viewport = page.getViewport({ scale: 1.0 });
      const width = viewport.width;

      // Strict Two-Column Detection: Left items X < 0.45*width, Right items X > 0.55*width
      const leftItems = items.filter((i) => i.transform && i.transform[4] < width * 0.45);
      const rightItems = items.filter((i) => i.transform && i.transform[4] > width * 0.55);

      // Require at least 20 text items in both distinct column bands
      const isTwoColumn = leftItems.length >= 20 && rightItems.length >= 20;

      if (!isTwoColumn) {
        const sorted = [...items].sort((a, b) => {
          const yA = a.transform?.[5] || 0;
          const yB = b.transform?.[5] || 0;
          const yDiff = yB - yA;
          if (Math.abs(yDiff) > 3.0) return yDiff;
          const xA = a.transform?.[4] || 0;
          const xB = b.transform?.[4] || 0;
          return xA - xB;
        });

        let text = '';
        for (let i = 0; i < sorted.length; i++) {
          if (i > 0) {
            const prevY = sorted[i - 1].transform?.[5] || 0;
            const currY = sorted[i].transform?.[5] || 0;
            if (Math.abs(prevY - currY) > 3.0) {
              text += '\n';
            } else {
              text += ' ';
            }
          }
          text += sorted[i].str;
        }

        return { text, isInstructionPage };
      }

      const sortedLeft = [...leftItems].sort((a, b) => {
        const yA = a.transform?.[5] || 0;
        const yB = b.transform?.[5] || 0;
        const yDiff = yB - yA;
        if (Math.abs(yDiff) > 3.0) return yDiff;
        const xA = a.transform?.[4] || 0;
        const xB = b.transform?.[4] || 0;
        return xA - xB;
      });

      const sortedRight = [...rightItems].sort((a, b) => {
        const yA = a.transform?.[5] || 0;
        const yB = b.transform?.[5] || 0;
        const yDiff = yB - yA;
        if (Math.abs(yDiff) > 3.0) return yDiff;
        const xA = a.transform?.[4] || 0;
        const xB = b.transform?.[4] || 0;
        return xA - xB;
      });

      let leftText = '';
      for (let i = 0; i < sortedLeft.length; i++) {
        if (i > 0) {
          const prevY = sortedLeft[i - 1].transform?.[5] || 0;
          const currY = sortedLeft[i].transform?.[5] || 0;
          if (Math.abs(prevY - currY) > 3.0) leftText += '\n';
          else leftText += ' ';
        }
        leftText += sortedLeft[i].str;
      }

      let rightText = '';
      for (let i = 0; i < sortedRight.length; i++) {
        if (i > 0) {
          const prevY = sortedRight[i - 1].transform?.[5] || 0;
          const currY = sortedRight[i].transform?.[5] || 0;
          if (Math.abs(prevY - currY) > 3.0) rightText += '\n';
          else rightText += ' ';
        }
        rightText += sortedRight[i].str;
      }

      return { text: `${leftText}\n${rightText}`, isInstructionPage };
    } catch (err: any) {
      this.logger.error(`extractPageTextSortedByColumns failed: ${err.message}`);
      return { text: '', isInstructionPage: false };
    }
  }
}
