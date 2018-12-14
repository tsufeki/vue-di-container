import 'jasmine';
import { Container, Inject, Service, Token, VueDiContainer } from '../src';

describe('index', () => {

    it('should construct exports', () => {
        expect(Container).toBeTruthy();
        expect(Inject).toBeTruthy();
        expect(Service).toBeTruthy();
        expect(Token).toBeTruthy();
        expect(VueDiContainer).toBeTruthy();
    });
});
