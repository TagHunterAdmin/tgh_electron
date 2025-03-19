// script.spec.js
const { expect } = require('chai');
const sinon = require('sinon');
const $ = require('jquery');

describe('viewDeviceRawData', function() {
    let clickEvent;

    beforeEach(function() {
        // Mock jQuery function
        sinon.stub($.fn, 'click').callsFake(function(callback) {
            callback(clickEvent);
        });
        sinon.stub($.fn, 'attr').callsFake(function(attr) {
            const attributes = {
                'data-device-id': '123',
                'data-launched-game-id': '456',
                'data-device-name': 'Test Device'
            };
            return attributes[attr];
        });
        sinon.stub($.fn, 'html');
        sinon.stub($.fn, 'modal');

        // Create a mock click event
        clickEvent = {
            target: $('<div data-device-id="123" data-launched-game-id="456" data-device-name="Test Device"></div>')[0]
        };
    });

    afterEach(function() {
        // Restore the original functions
        $.fn.click.restore();
        $.fn.attr.restore();
        $.fn.html.restore();
        $.fn.modal.restore();
    });

    it('should show the modal and set the device name in the header', function() {
        viewDeviceRawData();
        expect($('#device_raw_data').modal.calledWith('show')).to.be.true;
        expect($('#device_raw_data .modal-header h2').html.calledWith('Test Device')).to.be.true;
    });
});