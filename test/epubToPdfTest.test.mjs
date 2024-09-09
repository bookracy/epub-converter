import { expect } from 'chai';
import { buildPdf } from '../src/buildPdf';

const EPUB_URL = "https://backend.bookracy.ru/download/08eaf739cdb05b2553720c237139a3dd/Skeleton%20Key.epub";

describe('EPUB to PDF Conversion', function() {
    this.timeout(10000);

    it('should generate a PDF successfully from a valid EPUB URL', async function() {
        try {
            await buildPdf(EPUB_URL);
        } catch (error) {
            expect.fail("Expected buildPdf to succeed, but it threw an error: " + error.message);
        }
    });

    it('should throw an error for an invalid EPUB URL', async function() {
        const invalidUrl = "https://invalid-url.epub";
        try {
            await buildPdf(invalidUrl);
            expect.fail("Expected buildPdf to throw an error, but it succeeded");
        } catch (error) {
            expect(error).to.be.an('error');
        }
    });
});