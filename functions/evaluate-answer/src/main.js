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

        log(`Evaluating answer for: ${roleName}`);

        const prompt = `You are an expert interviewer evaluating a candidate's answer for a ${roleName} position.

Question: "${questionText}"
Candidate's Answer: "${answerText}"

Evaluate the answer strictly but fairly. Consider: relevance, accuracy, completeness, and clarity.
Score 60+ means passing.

Respond ONLY with valid JSON (no markdown, no extra text):
{"score": <0-100 integer>, "feedback": "<2-3 sentence constructive feedback mentioning what was good and what could be improved>", "passed": <true if score >= 60, else false>}`;

        const evaluation = await callOpenAI(prompt, 400);

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
function callOpenAI(prompt, maxTokens) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
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
