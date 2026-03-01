const https = require('https');

// ─── Appwrite Function: evaluate-answer ─────────────────────
// Entry point: src/main.js
// Called by: frontend with { questionText, answerText, roleName }
// Returns: { score, feedback, passed }

module.exports = async ({ req, res, log, error }) => {
    try {
        const { questionText, answerText, roleName } = req.body;

        if (!questionText || !roleName) {
            return res.json({ error: 'Missing required fields' }, 400);
        }

        // Handle empty answers
        if (!answerText || answerText.trim().length < 5) {
            return res.json({
                score: 0,
                feedback: 'No answer or answer too short. Please provide a detailed response.',
                passed: false
            });
        }

        // Limit answer length to prevent cost abuse
        if (answerText.length > 5000) {
            answerText = answerText.substring(0, 5000);
        }

        log(`Evaluating answer for: ${roleName}`);

        const systemMsg = `You are an expert interviewer evaluating answers for a ${roleName} position. Evaluate strictly but fairly on: relevance, accuracy, completeness, clarity. Score 60+ is passing. Respond ONLY with valid JSON: {"score": <0-100>, "feedback": "<2-3 sentences>", "passed": <true if score >= 60>}`;
        const userMsg = `Question: "${questionText}"\nCandidate's Answer: "${answerText}"`;

        const evaluation = await callOpenAI([
            { role: 'system', content: systemMsg },
            { role: 'user', content: userMsg }
        ], 400);

        return res.json({
            score: Math.round(evaluation.score || 0),
            feedback: evaluation.feedback || 'Could not generate feedback.',
            passed: Boolean(evaluation.passed)
        });

    } catch (err) {
        error('Function error: ' + err.message);
        // Fallback evaluation
        const wordCount = (req.body.answerText || '').trim().split(/\s+/).filter(w => w).length;
        const score = Math.min(Math.round(wordCount * 3), 80);
        return res.json({
            score,
            feedback: 'AI evaluation temporarily unavailable. Score estimated from answer length.',
            passed: score >= 60
        });
    }
};

// ─── OpenAI call helper ───────────────────────────────────────
function callOpenAI(messages, maxTokens) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.2,
            max_tokens: maxTokens
        });

        const opts = {
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(opts, (raw) => {
            let data = '';
            raw.on('data', chunk => data += chunk);
            raw.on('end', () => {
                try {
                    const resp = JSON.parse(data);
                    if (!resp.choices || !resp.choices[0]) {
                        return reject(new Error('No response from OpenAI'));
                    }
                    const content = resp.choices[0].message.content.trim()
                        .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    resolve(JSON.parse(content));
                } catch (e) {
                    reject(new Error('Parse error: ' + e.message));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}
