const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

exports.internalRunCode = (code, language, input = '') => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const lang = language?.toLowerCase() || 'javascript';
        
        // Define runtime settings
        const config = {
            javascript: {
                cmd: ['node', 'node.exe'],
                ext: 'js',
                unsafe: ['require(', 'process.', 'child_process', 'fs.', 'eval(', 'Function(']
            },
            python: {
                cmd: ['python', 'python3', 'py'],
                ext: 'py',
                unsafe: ['os.', 'sys.', 'subprocess', 'open(', 'eval(', 'exec(', 'socket', 'import os', 'import sys']
            }
        }[lang] || { cmd: ['node'], ext: 'js', unsafe: [] };

        // Security Audit
        if (config.unsafe.some(keyword => code.includes(keyword))) {
            return resolve({ success: false, error: `Security Restriction: Usage of forbidden logic detected in ${lang} source.` });
        }

        const scratchDir = path.join(__dirname, '..', 'scratch');
        if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

        const fileName = `runner_${crypto.randomUUID()}.${config.ext}`;
        const filePath = path.join(scratchDir, fileName);

        try {
            fs.writeFileSync(filePath, code);
        } catch (err) {
            return resolve({ success: false, error: 'Runtime Fault: Failed to scaffold execution file.' });
        }

        let child = null;
        let stdout = '';
        let stderr = '';
        let commandIdx = 0;

        const execute = (cmds) => {
            const currentCmd = cmds[commandIdx];
            child = spawn(currentCmd, [filePath]);

            if (input) {
                const cleanInput = input.endsWith('\n') ? input : input + '\n';
                child.stdin.write(cleanInput);
                child.stdin.end();
            }

            const timeoutId = setTimeout(() => {
                if (child) {
                    child.kill();
                    cleanup();
                    resolve({ success: false, error: 'TLE (Time Limit Exceeded): Process terminated after 10s.' });
                }
            }, 10000);

            child.stdout.on('data', (data) => stdout += data.toString());
            child.stderr.on('data', (data) => stderr += data.toString());

            child.on('error', (err) => {
                if (commandIdx < cmds.length - 1) {
                    commandIdx++;
                    clearTimeout(timeoutId);
                    return execute(cmds);
                }
                clearTimeout(timeoutId);
                cleanup();
                resolve({ success: false, error: `Interpreter Error: ${err.message}. Ensure ${lang} is installed.` });
            });

            child.on('close', (code) => {
                clearTimeout(timeoutId);
                cleanup();

                const finalOutput = stdout.trim();
                const finalError = stderr.trim();

                if (code !== 0 && !finalOutput) {
                    // Critical failure (interpreter vs syntax)
                    if (finalError.toLowerCase().includes('is not recognized') || finalError.toLowerCase().includes('not found')) {
                        if (commandIdx < cmds.length - 1) {
                            commandIdx++;
                            return execute(cmds);
                        }
                    }
                    return resolve({ 
                        success: false, 
                        error: finalError || `Runtime Error (Exit Code ${code})`,
                        executionTime: Date.now() - startTime
                    });
                }

                resolve({
                    success: true,
                    output: finalOutput || 'Execution finished (No Output)',
                    stderr: finalError,
                    executionTime: Date.now() - startTime
                });
            });
        };

        const cleanup = () => {
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (e) {}
        };

        execute(config.cmd);
    });
};

exports.runCode = async (req, res) => {
    const { code, language, input } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Project Source Code Missing' });

    const result = await exports.internalRunCode(code, language, input);
    res.json(result);
};
