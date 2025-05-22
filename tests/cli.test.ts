import { run } from '../src/cli/index';

describe('CLI Tests', () => {
    it('should run the CLI without errors', async () => {
        const exitCode = await run(['--help']);
        expect(exitCode).toBe(0);
    });

    it('should analyze a given website', async () => {
        const exitCode = await run(['analyze', 'https://example.com']);
        expect(exitCode).toBe(0);
    });

    it('should handle invalid commands gracefully', async () => {
        const exitCode = await run(['invalidCommand']);
        expect(exitCode).not.toBe(0);
    });

    it('should display help information', async () => {
        const exitCode = await run(['--help']);
        expect(exitCode).toBe(0);
    });
});