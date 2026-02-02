const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate 3 variations of a post: Original, Emoji-heavy, and Hashtag-focused.
 * @param {string} content - The base content to transform.
 * @returns {Promise<Object>} - Object containing the 3 variations.
 */
exports.generatePostVariations = async (content) => {
    try {
        const prompt = `
            You are a social media expert. Given the following base content, generate exactly 3 variations of a tweet.
            Keep each variation under 280 characters.
            
            Base Content: "${content}"
            
            Variation 1 (Professional/Original): A clean, professional version of the content.
            Variation 2 (Emoji-focused): An engaging version using relevant emojis to highlight key points.
            Variation 3 (Growth/Hashtag-focused): A punchy version that incorporates 3-5 trending and relevant hashtags.
            
            Return the result in JSON format with keys: "original", "emoji", "hashtag".
            Do not include any extra text or conversation, just the JSON object.
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const response = JSON.parse(chatCompletion.choices[0].message.content);
        return response;
    } catch (error) {
        console.error('Groq Generation Error:', error.message);
        throw new Error('Failed to generate variations: ' + error.message);
    }
};
