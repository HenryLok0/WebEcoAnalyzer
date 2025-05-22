import { ImageResourceAnalyzer } from '../src/analyzer/ImageResourceAnalyzer';

describe('ImageResourceAnalyzer', () => {
  it('should detect images and flag missing size attributes', () => {
    const content = '<img src="test.jpg">';
    const analyzer = new ImageResourceAnalyzer();
    const results = analyzer.analyze(content);
    expect(results).toHaveLength(1);
    expect(results[0].recommendation).toContain('Add width and height attributes');
  });

  it('should handle CSS background images', () => {
    const content = '<div style="background-image: url(test.jpg);"></div>';
    const analyzer = new ImageResourceAnalyzer();
    const results = analyzer.analyze(content);
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('image');
  });
});