const nodemailer = require('nodemailer');
const sendEmail = require('../../src/utils/emailService');

jest.mock('nodemailer');

describe('emailService', () => {
    let mockSendMail;
    let mockCreateTransport;

    beforeEach(() => {
        mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
        mockCreateTransport = {
            sendMail: mockSendMail
        };
        nodemailer.createTransport.mockReturnValue(mockCreateTransport);
    });

    it('should send an email successfully', async () => {
        const options = {
            email: 'test@example.com',
            subject: 'Test Subject',
            message: 'Test Message'
        };

        await sendEmail(options);

        expect(nodemailer.createTransport).toHaveBeenCalled();
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: options.email,
            subject: options.subject
        }));
    });

    it('should handle email sending failure', async () => {
        mockSendMail.mockRejectedValue(new Error('SMTP Error'));

        await expect(sendEmail({
            email: 'fail@example.com',
            subject: 'Fail',
            message: 'Fail'
        })).rejects.toThrow('SMTP Error');
    });
});
