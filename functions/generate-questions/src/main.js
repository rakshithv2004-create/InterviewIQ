const https = require('https');

// ─── Appwrite Function: generate-questions ───────────────────
// Entry point: src/main.js
// Called by: frontend with { course, roleId, roleName, courseName }
// Returns: { questions: [...] }

module.exports = async ({ req, res, log, error }) => {
    try {
        const { course, roleId, roleName, courseName } = req.body;

        if (!course || !roleId || !roleName) {
            return res.json({ error: 'Missing required fields: course, roleId, roleName' }, 400);
        }

        log(`Generating questions for: ${roleName} (${course})`);

        const prompt = `You are an expert interview coach. Generate exactly 10 interview questions for a ${roleName} position. The candidate is a ${courseName || course} graduate.

Requirements:
- Mix of technical, behavioral, and situational questions
- Each question should be specific to the ${roleName} role
- Include a difficulty level: easy, medium, or hard
- Include a category for each question
- Set appropriate time limits: easy=120s, medium=150s, hard=180s

Respond ONLY with a valid JSON array with this structure:
[{"text": "question text", "category": "Category Name", "difficulty": "easy|medium|hard", "timeLimit": 120}]`;

        const questions = await callOpenAI(prompt, 2000);

        if (!questions || questions.length < 5) {
            return res.json({ questions: null, error: 'AI returned insufficient questions' }, 200);
        }

        return res.json({ questions: questions.slice(0, 10) });

    } catch (err) {
        error('Function error: ' + err.message);
        return res.json({ error: 'Internal server error' }, 500);
    }
};

// ─── OpenAI call helper ───────────────────────────────────────
function callOpenAI(prompt, maxTokens) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
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
                        return reject(new Error('OpenAI returned no choices'));
                    }
                    const content = resp.choices[0].message.content.trim()
                        .replace(/```json\n?/g, '')
                        .replace(/```\n?/g, '')
                        .trim();
                    resolve(JSON.parse(content));
                } catch (e) {
                    reject(new Error('Failed to parse OpenAI response: ' + e.message));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}
