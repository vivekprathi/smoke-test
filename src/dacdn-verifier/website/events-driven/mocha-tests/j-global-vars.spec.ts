import { expect } from 'chai';

describe('j.php', function () {
    it('should have expected global variables', function () {
        const window = this.window;
        expect(window.VWO._.allSettings).not.to.be.undefined
        expect(window._vwo_cookieDomain).to.be.string
    });
});