/**
 * Utility for normalizing NEET scientific symbols, physics formulas, and chemistry equations.
 * Converts raw OCR font corruptions into clean Unicode characters.
 */
export class SymbolNormalizer {
  public static normalize(text: string): string {
    if (!text) return '';

    let s = text;

    // 1. Fractions
    s = s.replace(/\b1\/2\b/g, '½');
    s = s.replace(/\b1\/4\b/g, '¼');
    s = s.replace(/\b3\/4\b/g, '¾');
    s = s.replace(/\b1\/3\b/g, '⅓');
    s = s.replace(/\b2\/3\b/g, '⅔');

    // 2. Greek Letters & Physics Constants
    s = s.replace(/(?:\\pi|&pi;|π)/gi, 'π');
    s = s.replace(/(?:\\alpha|&alpha;|α)/gi, 'α');
    s = s.replace(/(?:\\beta|&beta;|β)/gi, 'β');
    s = s.replace(/(?:\\gamma|&gamma;|γ)/gi, 'γ');
    s = s.replace(/(?:\\delta|&delta;|δ)/gi, 'δ');
    s = s.replace(/(?:\\Delta|&Delta;|Δ)/gi, 'Δ');
    s = s.replace(/(?:\\theta|&theta;|θ)/gi, 'θ');
    s = s.replace(/(?:\\lambda|&lambda;|λ)/gi, 'λ');
    s = s.replace(/(?:\\mu|&mu;|μ)/gi, 'μ');
    s = s.replace(/(?:\\nu|&nu;|ν)/gi, 'ν');
    s = s.replace(/(?:\\sigma|&sigma;|σ)/gi, 'σ');
    s = s.replace(/(?:\\omega|&omega;|ω)/gi, 'ω');
    s = s.replace(/(?:\\Omega|&Omega;|Ω)/gi, 'Ω');
    s = s.replace(/(?:\\epsilon|&epsilon;|ε)/gi, 'ε');

    // 3. Mathematical & Chemical Symbols
    s = s.replace(/(?:\+\/-|\+-)/g, '±');
    s = s.replace(/(?:-->|->)/g, '→');
    s = s.replace(/(?:<==>|<=>|<->)/g, '⇌');
    s = s.replace(/(?:sqrt|\\sqrt)/gi, '√');
    s = s.replace(/\\degree|deg\s*C|°\s*C/gi, '°C');
    s = s.replace(/(?:\\angstrom|&Aring;|Å)/gi, 'Å');
    s = s.replace(/(?:<=|<=)/g, '≤');
    s = s.replace(/(?:>=|>=)/g, '≥');
    s = s.replace(/(?:!=|!=)/g, '≠');
    s = s.replace(/\\approx|approx/gi, '≈');
    s = s.replace(/\\infinity|inf/gi, '∞');

    // 4. Clean double spaces and line breaks
    s = s.replace(/[ \t]{2,}/g, ' ').trim();

    return s;
  }
}
