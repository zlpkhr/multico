import crypto from 'crypto';
import { VM } from 'vm2';

export const generateCodeHash = (code) => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

export const executeCode = (code, logger) => {
  const vm = new VM({
    timeout: 1000,
    sandbox: {
      console: {
        log: (...args) => logger.info(...args)
      },
      Math: Math
    }
  });
  
  return vm.run(code);
}; 