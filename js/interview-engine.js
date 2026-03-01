/* ============================================
   InterviewIQ — Interview Engine
   Full Appwrite DB persistence + Appwrite Functions
   ============================================ */

const InterviewEngine = (() => {
    const OPENAI_KEY = ''; // Set via Appwrite Functions env — never hardcode in frontend

    let state = {
        course: null,
        role: null,
        roleName: null,
        questions: [],
        currentIndex: 0,
        answers: [],
        sessionId: null,       // Appwrite document ID
        appwriteSessionId: null,
        timerInterval: null,
        timeRemaining: 0,
        isActive: false
    };

    // ─── AI: Generate questions ─────────────────────────────
    async function generateQuestionsAI(course, role, roleName) {
        try {
            // Try Appwrite Function first
            const funcResult = await tryAppwriteFunction('generate-questions', {
                course, roleId: role, roleName,
                courseName: CourseData[course].fullName
            });
            if (funcResult && funcResult.questions) return funcResult.questions;
        } catch (e) {
            console.log('Function call failed, falling back to direct API:', e.message);
        }

        // Fallback: direct OpenAI call
        try {
            const prompt = `You are an expert interview coach. Generate exactly 10 interview questions for a ${roleName} position. The candidate is a ${CourseData[course].fullName} graduate.

Requirements:
- Mix of technical, behavioral, and situational questions
- Each question should be specific to the ${roleName} role
- Include a difficulty level: easy, medium, or hard
- Include a category for each question
- Set appropriate time limits: easy=120s, medium=150s, hard=180s

Respond ONLY with a valid JSON array:
[{"text": "question text", "category": "Category Name", "difficulty": "easy|medium|hard", "timeLimit": 120}]`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + OPENAI_KEY
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) throw new Error('AI unavailable');
            const data = await response.json();
            const content = data.choices[0].message.content.trim();
            const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.warn('AI generation failed:', e.message);
            return null;
        }
    }

    // ─── AI: Evaluate answer ────────────────────────────────
    async function evaluateAnswerAI(questionText, answerText, roleName) {
        if (!answerText || answerText.trim().length < 10) {
            return { score: 0, feedback: 'No answer or answer too short.', passed: false };
        }

        try {
            // Try Appwrite Function first
            const funcResult = await tryAppwriteFunction('evaluate-answer', {
                questionText, answerText, roleName
            });
            if (funcResult && typeof funcResult.score === 'number') return funcResult;
        } catch (e) {
            console.log('Evaluate function failed, falling back:', e.message);
        }

        // Fallback: direct OpenAI
        try {
            const prompt = `You are an expert interviewer evaluating a candidate's answer for a ${roleName} position.

Question: "${questionText}"
Candidate's Answer: "${answerText}"

Evaluate the answer. Score 60+ is passing. Respond ONLY with valid JSON:
{"score": <0-100>, "feedback": "<2-3 sentence feedback>", "passed": <true if score >= 60>}`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + OPENAI_KEY
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 300
                })
            });

            if (!response.ok) throw new Error('AI unavailable');
            const data = await response.json();
            const content = data.choices[0].message.content.trim();
            const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.warn('AI evaluation failed:', e.message);
            const wordCount = answerText.trim().split(/\s+/).length;
            const score = Math.min(wordCount * 3, 85);
            return {
                score,
                feedback: 'AI evaluation temporarily unavailable. Score based on answer detail.',
                passed: score >= 60
            };
        }
    }

    // ─── Try calling an Appwrite Function ───────────────────
    async function tryAppwriteFunction(functionId, payload) {
        const { functions } = window.appwrite;
        const execution = await functions.createExecution(
            functionId,
            JSON.stringify(payload),
            false // async = false → wait for result
        );
        if (execution.responseStatusCode >= 200 && execution.responseStatusCode < 300) {
            return JSON.parse(execution.responseBody);
        }
        throw new Error('Function returned status ' + execution.responseStatusCode);
    }

    // ─── Start interview session ────────────────────────────
    async function startSession(course, roleId) {
        const courseInfo = CourseData[course];
        const roleInfo = courseInfo.roles.find(r => r.id === roleId);
        if (!roleInfo) throw new Error('Invalid role');

        state.course = course;
        state.role = roleId;
        state.roleName = roleInfo.name;
        state.currentIndex = 0;
        state.answers = [];
        state.isActive = true;

        // Generate questions (AI or fallback)
        Toast.info('Generating interview questions...');
        const aiQuestions = await generateQuestionsAI(course, roleId, roleInfo.name);

        if (aiQuestions && aiQuestions.length >= 10) {
            state.questions = aiQuestions.slice(0, 10);
            Toast.success('AI questions generated!');
        } else {
            state.questions = FallbackQuestions[roleId] || FallbackQuestions['default'];
            Toast.info('Using curated question bank.');
        }

        // Create session document in Appwrite
        const localId = 'session_' + Date.now();
        state.sessionId = localId;
        state.appwriteSessionId = await createSessionDocument(course, roleInfo.name);

        // Also save to localStorage as backup
        localStorage.setItem('currentSession', JSON.stringify({
            id: localId,
            appwriteId: state.appwriteSessionId,
            course, role: roleId, roleName: roleInfo.name,
            startedAt: new Date().toISOString(),
            questions: state.questions
        }));

        return state;
    }

    // ─── Create session in Appwrite DB ──────────────────────
    async function createSessionDocument(course, roleName) {
        try {
            const user = await Auth.getCurrentUser();
            if (!user) return null;

            const { databases } = window.appwrite;
            const { databaseId, collections } = AppwriteConfig;

            const doc = await databases.createDocument(
                databaseId,
                collections.sessions,
                Appwrite.ID.unique(),
                {
                    userId: user.$id,
                    course: course,
                    jobRole: roleName,
                    score: 0,
                    passedCount: 0,
                    failedCount: 0,
                    startedAt: new Date().toISOString()
                },
                [
                    Appwrite.Permission.read(Appwrite.Role.user(user.$id)),
                    Appwrite.Permission.update(Appwrite.Role.user(user.$id)),
                    Appwrite.Permission.delete(Appwrite.Role.user(user.$id))
                ]
            );
            console.log('Session created in Appwrite:', doc.$id);
            return doc.$id;
        } catch (e) {
            console.warn('Could not create session in Appwrite:', e.message);
            return null;
        }
    }

    // ─── Save individual answer to Appwrite ─────────────────
    async function saveAnswerDocument(answerRecord) {
        try {
            const user = await Auth.getCurrentUser();
            if (!user || !state.appwriteSessionId) return;

            const { databases } = window.appwrite;
            const { databaseId, collections } = AppwriteConfig;

            await databases.createDocument(
                databaseId,
                collections.sessionAnswers,
                Appwrite.ID.unique(),
                {
                    sessionId: state.appwriteSessionId,
                    questionText: (answerRecord.questionText || '').substring(0, 2048),
                    category: (answerRecord.category || 'General').substring(0, 128),
                    answerText: (answerRecord.answerText || '').substring(0, 4096),
                    aiScore: answerRecord.score || 0,
                    aiFeedback: (answerRecord.feedback || '').substring(0, 2048),
                    passed: answerRecord.passed || false,
                    timeTakenSeconds: answerRecord.timeTaken || 0
                },
                [
                    Appwrite.Permission.read(Appwrite.Role.user(user.$id)),
                    Appwrite.Permission.update(Appwrite.Role.user(user.$id)),
                    Appwrite.Permission.delete(Appwrite.Role.user(user.$id))
                ]
            );
        } catch (e) {
            console.warn('Could not save answer to Appwrite:', e.message);
        }
    }

    // ─── Get current question ───────────────────────────────
    function getCurrentQuestion() {
        if (state.currentIndex >= state.questions.length) return null;
        return {
            ...state.questions[state.currentIndex],
            index: state.currentIndex,
            total: state.questions.length
        };
    }

    // ─── Submit answer ──────────────────────────────────────
    async function submitAnswer(answerText, timeTaken) {
        const question = state.questions[state.currentIndex];
        const evaluation = await evaluateAnswerAI(question.text, answerText, state.roleName);

        const answerRecord = {
            questionIndex: state.currentIndex,
            questionText: question.text,
            category: question.category,
            answerText,
            timeTaken,
            timeLimit: question.timeLimit,
            ...evaluation
        };

        state.answers.push(answerRecord);
        state.currentIndex++;

        // Save to localStorage
        localStorage.setItem('sessionAnswers', JSON.stringify(state.answers));

        // Persist answer to Appwrite (non-blocking)
        saveAnswerDocument(answerRecord);

        return {
            evaluation,
            hasNext: state.currentIndex < state.questions.length,
            progress: state.currentIndex / state.questions.length
        };
    }

    // ─── Complete session ───────────────────────────────────
    function completeSession() {
        state.isActive = false;
        clearInterval(state.timerInterval);

        const totalScore = state.answers.reduce((sum, a) => sum + a.score, 0) / state.answers.length;
        const passedCount = state.answers.filter(a => a.passed).length;
        const failedCount = state.answers.filter(a => !a.passed).length;

        const results = {
            sessionId: state.sessionId,
            appwriteSessionId: state.appwriteSessionId,
            course: state.course,
            roleName: state.roleName,
            totalScore: Math.round(totalScore),
            passedCount,
            failedCount,
            totalQuestions: state.questions.length,
            answers: state.answers,
            completedAt: new Date().toISOString()
        };

        localStorage.setItem('lastResults', JSON.stringify(results));

        // Update session document with final score (non-blocking)
        updateSessionResults(results);

        return results;
    }

    // ─── Update session with final results ──────────────────
    async function updateSessionResults(results) {
        try {
            if (!results.appwriteSessionId) return;
            const user = await Auth.getCurrentUser();
            if (!user) return;

            const { databases } = window.appwrite;
            const { databaseId, collections } = AppwriteConfig;

            await databases.updateDocument(
                databaseId,
                collections.sessions,
                results.appwriteSessionId,
                {
                    score: results.totalScore,
                    passedCount: results.passedCount,
                    failedCount: results.failedCount,
                    completedAt: results.completedAt
                }
            );
            console.log('Session results updated in Appwrite');
        } catch (e) {
            console.warn('Could not update session results:', e.message);
        }
    }

    // ─── Get learning resources for a category ──────────────
    function getResourcesForCategory(category) {
        return LearningResources[category] || LearningResources['default'];
    }

    // ─── Reset ──────────────────────────────────────────────
    function reset() {
        clearInterval(state.timerInterval);
        state = {
            course: null, role: null, roleName: null,
            questions: [], currentIndex: 0, answers: [],
            sessionId: null, appwriteSessionId: null,
            timerInterval: null, timeRemaining: 0, isActive: false
        };
    }

    return {
        startSession, getCurrentQuestion, submitAnswer,
        completeSession, getResourcesForCategory, reset,
        getState: () => ({ ...state })
    };
})();

window.InterviewEngine = InterviewEngine;
