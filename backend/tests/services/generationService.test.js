const generationService = require('../../src/services/generationService');
const Groq = require('groq-sdk');

jest.mock('groq-sdk');

describe('GenerationService', () => {
    let mockCreate;

    beforeEach(() => {
        mockCreate = jest.fn();
        Groq.prototype.chat = {
            completions: {
                create: mockCreate
            }
        };
        jest.clearAllMocks();
    });

    it('should generate variations successfully', async () => {
        const mockContent = 'Test content';
        const mockResponse = {
            original: 'Original version',
            emoji: 'Emoji version 🚀',
            hashtag: 'Hashtag version #test'
        };

        mockCreate.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: JSON.stringify(mockResponse)
                    }
                }
            ]
        });

        const result = await generationService.generatePostVariations(mockContent);

        expect(result).toEqual(mockResponse);
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            messages: [
                {
                    role: 'user',
                    content: expect.stringContaining(mockContent)
                }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        }));
    });

    it('should throw error if Groq fails', async () => {
        const mockContent = 'Test content';
        mockCreate.mockRejectedValue(new Error('Groq API Error'));

        await expect(generationService.generatePostVariations(mockContent))
            .rejects
            .toThrow('Failed to generate variations: Groq API Error');
    });

    it('should throw error if response is not valid JSON', async () => {
        const mockContent = 'Test content';
        mockCreate.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: 'Invalid JSON'
                    }
                }
            ]
        });

        await expect(generationService.generatePostVariations(mockContent))
            .rejects
            .toThrow('Failed to generate variations');
    });
});
