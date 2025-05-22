import { run } from './cli/index';

run().then(exitCode => {
    process.exit(exitCode);
});