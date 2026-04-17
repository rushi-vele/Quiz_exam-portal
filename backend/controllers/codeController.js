const { spawn } = require('child_process');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

exports.internalRunCode = (code, language, input) => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        if (language?.toLowerCase() === 'javascript') {
            try {
                let output = '';
                const context = {
                    console: {
                        log: (...args) => { output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ') + '\n'; }
                    },
                    prompt: () => input || '',
                    Math, Date, Array, Object, String, Number, Boolean, Map, Set, JSON
                };
                const script = new vm.Script(code);
                script.runInNewContext(context, { timeout: 10000 });
                resolve({ 
                    success: true, 
                    output: output.trim() || 'Execution successful (no output)',
                    executionTime: Date.now() - startTime
                });
            } catch (err) {
                resolve({ success: false, error: `JS Error: ${err.message}` });
            }
        } else {
            // Python or default
            const dangerous = ['os.', 'sys.', 'subprocess', 'open(', 'eval(', 'exec(', 'socket', 'import os', 'import sys'];
            if (dangerous.some(keyword => code.includes(keyword))) {
                return resolve({ success: false, error: 'Security Violation: Restricted module usage detected.' });
            }

            const tempFilePath = path.join(__dirname, '..', 'scratch', `temp_${crypto.randomUUID()}.py`);
            const scratchDir = path.join(__dirname, '..', 'scratch');
            if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir);
            
            try {
                fs.writeFileSync(tempFilePath, code);
            } catch (err) {
                return resolve({ success: false, error: 'FileSystem Error: Scaffold failed.' });
            }

            const commands = ['python', 'python3', 'py'];
            let commandIdx = 0;

            const executeWithFallback = (cmd) => {
                let stdout = '';
                let stderr = '';
                const child = spawn(cmd, [tempFilePath]);

                if (input) {
                    const cleanInput = input.endsWith('\n') ? input : input + '\n';
                    child.stdin.write(cleanInput);
                    child.stdin.end();
                }

                const timeoutId = setTimeout(() => {
                    child.kill();
                    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                    resolve({ success: false, error: 'Execution stopped: Possible infinite loop or missing input' });
                }, 10000);

                child.stdout.on('data', (d) => stdout += d.toString());
                child.stderr.on('data', (d) => stderr += d.toString());

                child.on('close', (exitCode) => {
                    clearTimeout(timeoutId);
                    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

                    if (exitCode !== 0 && !stdout) {
                        if (commandIdx < commands.length - 1) {
                            commandIdx++;
                            return executeWithFallback(commands[commandIdx]);
                        }
                        return resolve({ success: false, error: stderr.trim() || 'Python Interpreter missing' });
                    }
                    resolve({ 
                        success: true, 
                        output: (stdout.trim() + '\n' + stderr.trim()).trim(),
                        executionTime: Date.now() - startTime
                    });
                });
            };
            executeWithFallback(commands[0]);
        }
    });
};

exports.runCode = async (req, res) => {
    const { code, language, input } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'No code provided' });

    const result = await exports.internalRunCode(code, language, input);
    res.json(result);
};
