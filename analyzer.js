const esprima = require('esprima');
const estraverse = require('estraverse');

function analyzeCode(code, language = 'auto') {
    const errors = [];

    // Simple language detection based on code content if language is 'auto'
    if (language === 'auto') {
        if (/^\s*function\s+|\s*var\s+|\s*let\s+|\s*const\s+/.test(code) || code.includes('console.')) {
            language = 'javascript';
        } else {
            language = 'generic';
        }
    }

    if (language === 'javascript') {
        try {
            const ast = esprima.parseScript(code, { loc: true });

            estraverse.traverse(ast, {
                enter: (node) => {
                    // Example: Check for console.log statements
                    if (node.type === 'CallExpression' && node.callee.name === 'console') {
                        errors.push({
                            message: 'Console statements should be removed in production code.',
                            line: node.loc.start.line,
                            column: node.loc.start.column
                        });
                    }
                    // Add more analysis rules as needed
                }
            });
        } catch (err) {
            errors.push({
                message: `JavaScript parsing error: ${err.description}`,
                line: err.lineNumber || null,
                column: err.index || null
            });
        }
    } else {
        // Generic analysis for other languages: check for TODO comments as example
        const lines = code.split('\n');
        lines.forEach((line, index) => {
            if (line.match(/TODO/i)) {
                errors.push({
                    message: 'Found TODO comment.',
                    line: index + 1,
                    column: line.indexOf('TODO') + 1
                });
            }
        });
    }

    return {
        errors,
        isFlawless: errors.length === 0
    };
}

module.exports = { analyzeCode };
