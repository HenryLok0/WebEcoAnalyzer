import { StaticAnalyzer } from '../src/analyzer/staticAnalyzer';

describe('StaticAnalyzer', () => {
  it('should detect jQuery and suggest optimization', () => {
    const content = '<script src="jquery-3.6.0.min.js"></script>';
    const analyzer = new StaticAnalyzer();
    const results = analyzer.analyze(content);
    expect(results).toContain('Using jQuery (jquery-3.6.0.min.js). Consider using slim version or modern alternatives like vanilla JS.');
  });
});